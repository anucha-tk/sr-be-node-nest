import { Test, TestingModule } from '@nestjs/testing';
import { AuthTestController } from './auth-test.controller';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { ApiKeyService } from '../services/api-key.service';

describe('AuthTestController', () => {
  let controller: AuthTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthTestController],
      providers: [
        {
          provide: APP_GUARD,
          useValue: { canActivate: () => true },
        },
        {
          provide: ApiKeyGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: ApiKeyService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthTestController>(AuthTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return public message', () => {
    expect(controller.getPublic()).toEqual({
      message: 'This is a public endpoint',
    });
  });

  it('should return protected message with user', () => {
    const user = { sub: '123' };
    expect(controller.getProtected(user)).toEqual({
      message: 'This is a protected endpoint',
      user,
    });
  });

  it('should return admin-only message with user', () => {
    const user = { sub: 'admin-123' };
    expect(controller.getAdminOnly(user)).toEqual({
      message: 'This is an admin-only endpoint',
      user,
    });
  });

  it('should return supplier-only message with user', () => {
    const user = { sub: 'supplier-123' };
    expect(controller.getSupplierOnly(user)).toEqual({
      message: 'This is a supplier-only endpoint',
      user,
    });
  });
});
