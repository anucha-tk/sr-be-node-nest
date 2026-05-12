import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AuthModule } from './modules/auth/auth.module';
import { Global, Module, Injectable, CanActivate } from '@nestjs/common';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { PrismaService } from './shared/prisma/prisma.service';
import { ApiKeyService } from './modules/auth/services/api-key.service';

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
    { provide: 'KEYCLOAK_LOGGER', useValue: console },
    { provide: 'KEYCLOAK_MULTITENANT_SERVICE', useValue: {} },
    { provide: AuthGuard, useClass: MockGuard },
    { provide: ResourceGuard, useClass: MockGuard },
    { provide: RoleGuard, useClass: MockGuard },
    {
      provide: ApiKeyService,
      useValue: { validateKey: jest.fn() },
    },
  ],
  exports: [
    'KEYCLOAK_INSTANCE',
    'KEYCLOAK_CONNECT_OPTIONS',
    'KEYCLOAK_LOGGER',
    'KEYCLOAK_MULTITENANT_SERVICE',
    AuthGuard,
    ResourceGuard,
    RoleGuard,
    ApiKeyService,
  ],
})
class MockAuthModule {}

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.KEYCLOAK_ISSUER_URL = 'http://localhost:8080/realms/sr-realm';
    process.env.KEYCLOAK_CLIENT_ID = 'sr-be-client';
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/sr_be_db';
    process.env.PORT = '3000';
  });

  it('should compile the module', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(AuthModule)
      .useModule(MockAuthModule)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'NODE_ENV') return 'development';
          if (key === 'DATABASE_URL')
            return 'postgresql://postgres:postgres@localhost:5432/sr_be_db';
          return 'dummy';
        }),
      })
      // Override the global guards provided in AppModule
      .overrideProvider(AuthGuard)
      .useClass(MockGuard)
      .overrideProvider(ResourceGuard)
      .useClass(MockGuard)
      .overrideProvider(RoleGuard)
      .useClass(MockGuard)
      .compile();

    expect(module).toBeDefined();
    await module.close();
  });
});
