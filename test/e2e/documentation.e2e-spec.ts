import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { PrismaService } from '../../src/shared/prisma/prisma.service';
import request from 'supertest';
import type { Request, Response } from 'express';

jest.mock('@scalar/nestjs-api-reference', () => ({
  apiReference: jest
    .fn()
    .mockImplementation(() => (req: Request, res: Response) => {
      res.status(200).send('<title>API Reference</title>scalar');
    }),
}));

describe('Documentation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // We need to mirror the setup in main.ts for the E2E test to see the same OpenAPI/Scalar config
    const config = new DocumentBuilder()
      .setTitle('sr-be-node-nest API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    cleanupOpenApiDoc(document);

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const { apiReference } = require('@scalar/nestjs-api-reference');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use('/docs', apiReference({ content: document }));

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /docs should return Scalar UI', async () => {
    const response = await request(app.getHttpServer() as string)
      .get('/docs')
      .expect(200);

    expect(response.text).toContain('<title>API Reference</title>');
    expect(response.text).toContain('scalar');
  });

  it('should include both security schemes in documentation', () => {
    const config = new DocumentBuilder()
      .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'bearer')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    expect(document.components?.securitySchemes).toBeDefined();
    expect(document.components?.securitySchemes?.['bearer']).toBeDefined();
    expect(document.components?.securitySchemes?.['api-key']).toBeDefined();
  });
});
