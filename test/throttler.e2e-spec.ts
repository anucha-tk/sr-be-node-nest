import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Throttler (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should throttle requests after limit is exceeded', async () => {
    // Logic moved to second test for simplicity in this demo
  });

  it('should return standard envelope on 429', async () => {
    // We'll mock the guard to always throw for this specific test case
    // to verify the envelope without hitting actual limits.
    // But better to test the real integration.

    // Let's try to hit the / (root) endpoint which is @Public()
    for (let i = 0; i < 100; i++) {
      await request(app.getHttpServer()).get('/');
    }

    const res = await request(app.getHttpServer()).get('/');
    expect(res.status).toBe(429);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'THROTTLED',
        message: 'Rate limit exceeded. Please try again later.',
      },
    });
  });
});
