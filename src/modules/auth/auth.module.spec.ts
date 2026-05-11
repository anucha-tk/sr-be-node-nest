import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';

describe('AuthModule', () => {
  let module: TestingModule;

  it('should compile the module', async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'KEYCLOAK_ISSUER_URL')
            return 'http://localhost:8080/realms/sr-realm';
          if (key === 'KEYCLOAK_CLIENT_ID') return 'sr-be-client';
          return null;
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });

  it('should throw error if KEYCLOAK_ISSUER_URL is missing', async () => {
    const testingModule = Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn(() => null),
      });

    await expect(testingModule.compile()).rejects.toThrow(
      'KEYCLOAK_ISSUER_URL is not defined',
    );
  });

  it('should handle different issuer URL formats', async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'KEYCLOAK_ISSUER_URL')
            return 'https://auth.example.com/realms/custom';
          if (key === 'KEYCLOAK_CLIENT_ID') return 'client-123';
          return null;
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });

  it('should use default realm if path is empty', async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'KEYCLOAK_ISSUER_URL') return 'http://localhost:8080/';
          if (key === 'KEYCLOAK_CLIENT_ID') return 'client-123';
          return null;
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });
});
