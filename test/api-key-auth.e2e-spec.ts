/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import request from 'supertest';
import { ApiKeyGuard } from '../src/common/guards/api-key.guard';
import { ApiKeyService } from '../src/modules/auth/services/api-key.service';
import { AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { PrismaService } from '../src/shared/prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Controller('test-api-key')
class TestController {
  @Get()
  @UseGuards(ApiKeyGuard)
  test() {
    return { success: true };
  }
}

const mockGuard = {
  canActivate: () => true,
};

const mockPrisma = {
  apiKey: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
};

describe('API Key Authentication (E2E)', () => {
  let app: INestApplication;
  let apiKeyService: ApiKeyService;

  beforeAll(async () => {
    mockPrisma.apiKey.findUnique.mockResolvedValue(null);
    mockPrisma.apiKey.create.mockImplementation((args) =>
      Promise.resolve({
        id: 'mock-id',
        ...args.data,
      }),
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        ApiKeyGuard,
        ApiKeyService,
        Reflector,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthGuard, useValue: mockGuard },
        { provide: ResourceGuard, useValue: mockGuard },
        { provide: RoleGuard, useValue: mockGuard },
        { provide: 'KEYCLOAK_INSTANCE', useValue: {} },
        { provide: 'KEYCLOAK_CONNECT_OPTIONS', useValue: {} },
        { provide: 'KEYCLOAK_LOGGER', useValue: console },
        { provide: 'KEYCLOAK_MULTITENANT_SERVICE', useValue: {} },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    apiKeyService = moduleFixture.get<ApiKeyService>(ApiKeyService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('API Key Guard Validation', () => {
    it('should allow access with a valid x-api-key', async () => {
      const { key } = await apiKeyService.createKey('test', ['read']);
      const [id] = key.split('.');

      mockPrisma.apiKey.findUnique.mockImplementation(({ where }) => {
        if (where.id === id) {
          return Promise.resolve(
            mockPrisma.apiKey.create.mock.results[
              mockPrisma.apiKey.create.mock.results.length - 1
            ].value,
          );
        }
        return Promise.resolve(null);
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/test-api-key')
        .set('x-api-key', key);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.success).toBe(true);
    });

    it('should deny access with invalid key', async () => {
      mockPrisma.apiKey.findUnique.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/test-api-key')
        .set('x-api-key', '1.wrong');

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
