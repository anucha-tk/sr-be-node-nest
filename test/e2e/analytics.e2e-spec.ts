/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  VersioningType,
  Global,
  Module,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AnalyticsController } from './../../src/modules/analytics/analytics.controller';
import { AnalyticsService } from './../../src/modules/analytics/analytics.service';
import { PrismaService } from './../../src/shared/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { ElasticsearchService } from '@nestjs/elasticsearch';

let currentRole = 'admin';

@Injectable()
class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = {
      sub: 'USER-001',
      preferred_username: 'testuser',
      realm_access: { roles: [currentRole] },
    };
    return true;
  }
}

@Global()
@Module({
  providers: [
    Reflector,
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
    { provide: APP_GUARD, useClass: MockGuard },
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

describe('Analytics (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let elasticsearchService: ElasticsearchService;

  const mockElasticsearchService = {
    search: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              aggregate: jest.fn(),
              groupBy: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    prisma = app.get<PrismaService>(PrismaService);
    elasticsearchService = app.get<ElasticsearchService>(ElasticsearchService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /v1/analytics/summary should return summary for admin', async () => {
    currentRole = 'admin';
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]); // Mock empty MV to fallback to aggregation
    (prisma.invoice.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { amount: 1000 } }) // PAID
      .mockResolvedValueOnce({ _sum: { amount: 500 } }); // PENDING
    (prisma.invoice.groupBy as jest.Mock).mockResolvedValueOnce([
      { supplierId: 's1' },
    ]);

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/analytics/summary')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      totalRevenue: 1000,
      totalPending: 500,
      supplierCount: 1,
    });
    expect(response.body.meta.executionTimeMs).toBeDefined();
  });

  it('GET /v1/analytics/trends should return trends for admin', async () => {
    currentRole = 'admin';
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
      {
        period: '2026-01',
        total_amount: 1000,
        last_refreshed: new Date('2026-05-13T09:00:00.000Z'),
      },
    ]);
    (prisma.invoice.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { amount: 1000 } }) // Current
      .mockResolvedValueOnce({ _sum: { amount: 800 } }); // Previous

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/analytics/trends?granularity=monthly')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.trends).toHaveLength(1);
    expect(response.body.data.comparison.growthPercentage).toBe(25);
  });

  it('GET /v1/analytics/search-stats should return search stats for admin', async () => {
    currentRole = 'admin';
    const mockSearchResponse = {
      took: 5,
      hits: {
        total: { value: 10, relation: 'eq' },
        hits: [],
      },
      aggregations: {
        stats: { count: 10, sum: 1000, avg: 100, min: 10, max: 200 },
        by_status: {
          buckets: [{ key: 'PAID', doc_count: 10 }],
        },
        by_supplier: {
          buckets: [{ key: 'Supplier 1', doc_count: 10 }],
        },
        trends: {
          buckets: [
            {
              key_as_string: '2026-05-17',
              doc_count: 10,
              total_amount: { value: 1000 },
            },
          ],
        },
      },
    };

    (elasticsearchService.search as jest.Mock).mockResolvedValueOnce(
      mockSearchResponse,
    );

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/analytics/search-stats?granularity=daily&q=test')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.stats.count).toBe(10);
    expect(response.body.data.facets.status[0].key).toBe('PAID');
    expect(response.body.data.trends[0].amount).toBe(1000);
  });
});
