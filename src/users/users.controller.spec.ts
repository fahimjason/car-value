import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({ id, email: 'user@gmail.com', password: 'user' } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'asdf' } as User]);
      },
      // remove: () => { },
      // update: () => { }
    };

    fakeAuthService = {
      // signup: () => { },
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User)
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('user@gmail.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('user@gmail.com');
  });

  it('findUser returns a single user with a given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id not found', async () => {
    fakeUserService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -10 };

    const user = await controller.signin({ email: 'user@gmail.com', password: 'user' }, session);

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
