/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
  class Test {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test(@decorator() value: unknown) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args as object)[0]].factory;
}

describe('CurrentUser Decorator', () => {
  it('should return null if user is not in request', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockRequest = {};
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, mockContext);
    expect(result).toBeNull();
  });

  it('should return user info if user is in request', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {
      sub: 'user-123',
      preferred_username: 'johndoe',
      realm_access: {
        roles: ['admin', 'user'],
      },
    };
    const mockRequest = { user: mockUser };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, mockContext);
    expect(result).toEqual({
      ...mockUser,
      sub: 'user-123',
      preferred_username: 'johndoe',
      roles: ['admin', 'user'],
    });
  });

  it('should return empty roles if realm_access is missing', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {
      sub: 'user-123',
      preferred_username: 'johndoe',
    };
    const mockRequest = { user: mockUser };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = factory(null, mockContext);
    expect(result.roles).toEqual([]);
  });
});
