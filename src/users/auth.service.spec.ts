import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        // Create a fake copy of user service
        const fakeUserService: Partial<UsersService> = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) => Promise.resolve({ id: 1, email, password } as User)
        }

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUserService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('user@gmail.com', 'user');

        expect(user.password).not.toEqual('user');

        const [salt, hash] = user.password.split('.');

        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    })
})