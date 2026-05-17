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
} from '@nestjs/common';
import request from 'supertest';
import { SearchController } from './../../src/modules/search/search.controller';
import { SearchService } from './../../src/modules/search/search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';

@Injectable()
class MockGuard implements CanActivate {
  canActivate() {
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

describe('Search (e2e)', () => {
  let app: INestApplication;
  let elasticsearchService: ElasticsearchService;

  const mockElasticsearchService = {
    search: jest.fn(),
    indices: {
      exists: jest.fn().mockResolvedValue(true),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [SearchController],
      providers: [
        SearchService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.enableVersioning();
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    elasticsearchService = app.get<ElasticsearchService>(ElasticsearchService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /v1/search should return fuzzy search results', async () => {
    const mockSearchResponse = {
      took: 15,
      hits: {
        total: { value: 1, relation: 'eq' },
        hits: [
          {
            _id: '1',
            _score: 2.0,
            _source: {
              id: '1',
              type: 'invoice',
              invoiceNumber: 'INV-12345',
              description: 'Cloud subscription',
            },
          },
        ],
      },
    };

    (elasticsearchService.search as jest.Mock).mockResolvedValue(
      mockSearchResponse,
    );

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/search?q=cloud')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.hits).toHaveLength(1);
    expect(response.body.data.hits[0].invoiceNumber).toBe('INV-12345');
    expect(response.body.meta.executionTimeMs).toBeDefined();
    expect(response.body.data.total).toBe(1);

    expect(elasticsearchService.search).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          multi_match: expect.objectContaining({
            query: 'cloud',
            fuzziness: 'AUTO',
          }),
        },
      }),
    );
  });

  it('GET /v1/search should return 400 if query is missing', async () => {
    await request(app.getHttpServer() as string)
      .get('/api/v1/search')
      .expect(400);
  });
});
