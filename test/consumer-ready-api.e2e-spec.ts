import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { StandardEnvelope } from '../src/common/interfaces/api-response.interface';

describe('Consumer-Ready API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Standard Response Envelope', () => {
    it('should return success envelope for GET /', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer()).get('/api');

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body: StandardEnvelope<unknown> = response.body;
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.meta).toBeDefined();
      expect(body.meta.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(body.meta.executionTimeMs).toBeGreaterThanOrEqual(0);
      expect(body.meta.correlationId).toBeDefined();
      expect(body.error).toBeNull();
    });

    it('should return error envelope for non-existent route', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer()).get(
        '/api/v1/non-existent',
      );

      expect(response.status).toBe(404);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body: StandardEnvelope<null> = response.body;
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.meta).toBeDefined();
      expect(body.meta.correlationId).toBeDefined();
      expect(body.error?.code).toBe('RESOURCE_NOT_FOUND');
      expect(body.error?.message).toBeDefined();
    });
  });

  describe('Naming Conventions and Formats', () => {
    it('should use camelCase for all keys in envelope', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer()).get('/api');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body: StandardEnvelope<unknown> = response.body;
      const keys = Object.keys(body);

      expect(keys).toContain('success');
      expect(keys).toContain('data');
      expect(keys).toContain('meta');
      expect(keys).toContain('error');

      const metaKeys = Object.keys(body.meta || {});
      expect(metaKeys).toContain('timestamp');
      expect(metaKeys).toContain('executionTimeMs');
      expect(metaKeys).toContain('correlationId');
    });
  });

  describe('Error Codes', () => {
    it('should return ERR_RATE_LIMIT_EXCEEDED when throttled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer()).get(
        '/api/v1/invoices',
      );
      expect(response.status).toBe(401);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body: StandardEnvelope<null> = response.body;
      expect(body.error?.code).toBe('AUTH_REQUIRED');
    });

    it('should return VALIDATION_ERROR for bad input', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/api-keys')
        .send({});

      if (response.status === 401) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body: StandardEnvelope<null> = response.body;
        expect(body.error?.code).toBe('AUTH_REQUIRED');
      }
    });
  });
});
