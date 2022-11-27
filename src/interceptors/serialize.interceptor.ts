import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

export class SerializeInterceptors implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        // Run something before a request is handled 
        // by the request handler
        console.log('I am running before the request handler', context);

        return next.handle().pipe(
            map((data: any) => {
                // Run something before a response sent out
                console.log('I am before a response sent out', data);
            })
        )
    }
}
