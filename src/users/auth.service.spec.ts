import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UsersService>

    beforeEach(async () => {
        // Create a fake copy of user service
        fakeUserService = {
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
    });

    it('throws an error if signs up with the email that is in used', async () => {
        fakeUserService.find = async () => Promise.resolve([{ id: 1, email: 'abc@gmail.com', password: 'abc' } as User]);

        await expect(service.signup('user@gmail.com', 'user')).rejects.toThrow(BadRequestException);
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(service.signin('user@gmail.com', 'user')).rejects.toThrow(NotFoundException);
    });
});