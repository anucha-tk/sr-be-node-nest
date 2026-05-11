/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Global,
  Module,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AuthTestController } from './../src/modules/auth/controllers/auth-test.controller';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { PrismaService } from './../src/shared/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { Reflector, APP_GUARD } from '@nestjs/core';

@Injectable()
class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Simulate user for current-user decorator
    req.user = {
      sub: '123',
      preferred_username: 'testuser',
      email: 'test@example.com',
      realm_access: { roles: ['admin'] },
    };
    return true;
  }
}

import { ApiKeyGuard } from '../src/common/guards/api-key.guard';
import { ApiKeyService } from '../src/modules/auth/services/api-key.service';

@Global()
@Module({
  controllers: [AuthTestController],
  providers: [
    Reflector,
    { provide: 'KEYCLOAK_INSTANCE', useValue: {} },
    { provide: 'KEYCLOAK_CONNECT_OPTIONS', useValue: {} },
    {
      provide: 'KEYCLOAK_LOGGER',
      useValue: {
        verbose: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    },
    { provide: 'KEYCLOAK_MULTITENANT_SERVICE', useValue: {} },
    { provide: APP_GUARD, useClass: MockGuard },
    { provide: AuthGuard, useClass: MockGuard },
    { provide: ResourceGuard, useClass: MockGuard },
    { provide: RoleGuard, useClass: MockGuard },
    { provide: ApiKeyGuard, useClass: MockGuard },
    { provide: ApiKeyService, useValue: {} },
  ],
  exports: [
    'KEYCLOAK_INSTANCE',
    'KEYCLOAK_CONNECT_OPTIONS',
    'KEYCLOAK_LOGGER',
    'KEYCLOAK_MULTITENANT_SERVICE',
    AuthGuard,
    ResourceGuard,
    RoleGuard,
    ApiKeyGuard,
    ApiKeyService,
  ],
})
class MockAuthModule {}

describe('Auth RBAC (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      providers: [
        {
          provide: PrismaService,
          useValue: { $connect: jest.fn(), $disconnect: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth-test/protected (GET) - should return current user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer()).get(
      '/auth-test/protected',
    );
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      sub: '123',
      email: 'test@example.com',
    });
  });
});
