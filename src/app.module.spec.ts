import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;

  it('should compile the module in development', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'NODE_ENV') return 'development';
          if (key === 'KEYCLOAK_ISSUER_URL')
            return 'http://localhost:8080/realms/sr-realm';
          return 'dummy';
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });

  it('should compile the module in production', async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'NODE_ENV') return 'production';
          if (key === 'KEYCLOAK_ISSUER_URL')
            return 'http://localhost:8080/realms/sr-realm';
          return 'dummy';
        }),
      })
      .compile();

    expect(module).toBeDefined();
  });
});
