import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useValue: {
        apiKey: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      },
    },
  ],
  exports: [PrismaService],
})
class MockPrismaModule {}

describe('AuthModule', () => {
  let module: TestingModule;

  it('should compile the module', async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MockPrismaModule,
        AuthModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'KEYCLOAK_ISSUER_URL')
            return 'http://localhost:8080/realms/sr-realm';
          if (key === 'KEYCLOAK_CLIENT_ID') return 'sr-be-client';
          return 'dummy';
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });
});
