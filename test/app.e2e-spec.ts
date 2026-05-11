/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Test, TestingModule } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

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
      canActivate() {
        return true;
      }
    },
    RoleGuard: class MockRoleGuard {
      canActivate() {
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

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
