import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Global,
  Module,
  Injectable,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { PrismaService } from './../src/shared/prisma/prisma.service';

@Injectable()
class MockGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

@Global()
@Module({
  providers: [
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
    { provide: AuthGuard, useClass: MockGuard },
    { provide: ResourceGuard, useClass: MockGuard },
    { provide: RoleGuard, useClass: MockGuard },
  ],
  exports: [
    'KEYCLOAK_INSTANCE',
    'KEYCLOAK_CONNECT_OPTIONS',
    'KEYCLOAK_LOGGER',
    'KEYCLOAK_MULTITENANT_SERVICE',
    AuthGuard,
    ResourceGuard,
    RoleGuard,
  ],
})
class MockAuthModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: { $connect: jest.fn(), $disconnect: jest.fn() },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
