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
        fakeUserService.find = () => Promise.resolve([{ id: 1, email: 'abc@gmail.com', password: 'abc' } as User]);

        await expect(service.signup('user@gmail.com', 'user')).rejects.toThrow(BadRequestException);
    });

    it('throws if signin is called with an unused email', async () => {
        await expect(service.signin('user@gmail.com', 'user')).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        fakeUserService.find = () => Promise.resolve([{ email: 'abc@gmail.com', password: 'abc' } as User]);

        await expect(service.signin('user@gmail.com', 'user')).rejects.toThrow(BadRequestException);
    });

    it('returns a user if current password is provided', async () => {
        fakeUserService.find = () => Promise.resolve([
            {
                email: 'user@gmail.com',
                password: '44a30f79ab269468.0cfe22a725463ba7ef99e569fced41aad3356ac972ddf6e87013760882f66e50'
            } as User
        ]);

        const user = await service.signin('user@gmail.com', 'password');

        expect(user).toBeDefined()
    });
});