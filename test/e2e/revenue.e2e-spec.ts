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
import { RevenueController } from './../../src/modules/revenue/revenue.controller';
import { RevenueService } from './../../src/modules/revenue/revenue.service';
import { PrismaService } from './../../src/shared/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { NotificationsGateway } from '../../src/modules/notifications/notifications.gateway';
import { ActivityService } from '../../src/modules/notifications/activity.service';

@Injectable()
class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = {
      sub: 'SUP-001',
      preferred_username: 'supplier1',
      realm_access: { roles: ['supplier'] },
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
    { provide: 'KAFKA_SERVICE', useValue: { emit: jest.fn() } },
    {
      provide: NotificationsGateway,
      useValue: {
        notifyAuditLog: jest.fn(),
        notifyBalanceUpdate: jest.fn(),
        notifySystemPulse: jest.fn(),
      },
    },
    {
      provide: ActivityService,
      useValue: {
        emit: jest.fn(),
        getStream: jest.fn(),
      },
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
    'KAFKA_SERVICE',
    NotificationsGateway,
    ActivityService,
  ],
})
class MockAuthModule {}

describe('Revenue (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [RevenueController],
      providers: [
        RevenueService,
        {
          provide: PrismaService,
          useValue: {
            supplierRevenue: {
              findUnique: jest.fn(),
              deleteMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /v1/suppliers/me/revenue should return balance for authenticated supplier', async () => {
    const mockRevenue = {
      supplierId: 'SUP-001',
      balance: { toNumber: () => 1250.5 },
      updatedAt: new Date(),
    };

    (prisma.supplierRevenue.findUnique as jest.Mock).mockResolvedValue(
      mockRevenue,
    );

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/suppliers/me/revenue')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(1250.5);
    expect(response.body.data.currency).toBe('USD');
    expect(response.body.data.metadata.lastUpdated).toBeDefined();
    expect(response.body.meta.executionTimeMs).toBeDefined();
  });

  it('GET /v1/suppliers/me/revenue should return zero balance if no record exists', async () => {
    (prisma.supplierRevenue.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/suppliers/me/revenue')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(0);
  });
});
