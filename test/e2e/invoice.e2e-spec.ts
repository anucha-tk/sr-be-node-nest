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
import { InvoiceController } from './../../src/modules/invoice/invoice.controller';
import { InvoiceService } from './../../src/modules/invoice/invoice.service';
import { PrismaService } from './../../src/shared/prisma/prisma.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { InvoiceStatus, Prisma } from '@prisma/client';
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
    ActivityService,
  ],
})
class MockAuthModule {}

describe('Invoice (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MockAuthModule],
      controllers: [InvoiceController],
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
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
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /v1/invoices should return paginated list in standard envelope', async () => {
    const mockItems = [
      {
        id: 'uuid-1',
        invoiceNumber: 'INV-001',
        supplierId: 'SUP-001',
        amount: new Prisma.Decimal(100.5),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prisma.invoice.count as jest.Mock).mockResolvedValue(1);
    (prisma.invoice.findMany as jest.Mock).mockResolvedValue(mockItems);

    const response = await request(app.getHttpServer() as string)
      .get('/api/v1/invoices?limit=10&offset=0')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].amount).toBe(100.5);
    expect(response.body.meta.pagination).toEqual({
      limit: 10,
      offset: 0,
      total: 1,
    });
  });

  it('GET /v1/invoices should apply filters', async () => {
    (prisma.invoice.count as jest.Mock).mockResolvedValue(0);
    (prisma.invoice.findMany as jest.Mock).mockResolvedValue([]);

    await request(app.getHttpServer() as string)
      .get('/api/v1/invoices?status=PENDING')
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
        }),
      }),
    );
  });
});
