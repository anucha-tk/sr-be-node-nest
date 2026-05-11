import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// Jest mock must be before any imports that use it
jest.mock('nest-keycloak-connect', () => {
  const originalModule = jest.requireActual('nest-keycloak-connect');
  class MockKeycloakConnectModule {
    static registerAsync() {
      return {
        module: MockKeycloakConnectModule,
        providers: [],
        exports: [],
      };
    }
  }
  return {
    ...originalModule,
    AuthGuard: class MockAuthGuard {
      canActivate(context: any) {
        const req = context.switchToHttp().getRequest();
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/auth-test/public')) return true;

        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw new (require('@nestjs/common').UnauthorizedException)();
        }

        const token = authHeader.split(' ')[1];
        if (token === 'admin-jwt') {
          req.user = { sub: 'admin-1', realm_access: { roles: ['admin'] } };
          return true;
        } else if (token === 'supplier-jwt') {
          req.user = {
            sub: 'supplier-1',
            realm_access: { roles: ['supplier'] },
          };
          return true;
        }

        throw new (require('@nestjs/common').UnauthorizedException)();
      }
    },
    RoleGuard: class MockRoleGuard {
      canActivate(context: any) {
        const req = context.switchToHttp().getRequest();
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/auth-test/public')) return true;

        const roles = req.user?.realm_access?.roles || [];
        if (req.url.includes('admin-only') && !roles.includes('admin')) {
          throw new (require('@nestjs/common').ForbiddenException)();
        }
        if (req.url.includes('supplier-only') && !roles.includes('supplier')) {
          throw new (require('@nestjs/common').ForbiddenException)();
        }
        return true;
      }
    },
    ResourceGuard: class MockResourceGuard {
      canActivate() {
        return true;
      }
    },
    KeycloakConnectModule: MockKeycloakConnectModule,
  };
});

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth-test/public (GET) - Should allow public access', () => {
    return request(app.getHttpServer())
      .get('/auth-test/public')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe('This is a public endpoint');
      });
  });

  it('/auth-test/admin-only (GET) - No JWT -> 401', () => {
    return request(app.getHttpServer())
      .get('/auth-test/admin-only')
      .expect(401)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBeDefined();
      });
  });

  it('/auth-test/admin-only (GET) - Valid Admin JWT -> 200', () => {
    return request(app.getHttpServer())
      .get('/auth-test/admin-only')
      .set('Authorization', 'Bearer admin-jwt')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
      });
  });

  it('/auth-test/admin-only (GET) - Supplier JWT to Admin route -> 403', () => {
    return request(app.getHttpServer())
      .get('/auth-test/admin-only')
      .set('Authorization', 'Bearer supplier-jwt')
      .expect(403)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBeDefined();
      });
  });
});
