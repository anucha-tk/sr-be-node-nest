import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from '../../modules/auth/services/api-key.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ApiKey } from '@prisma/client';

interface RequestWithAuth {
  headers: Record<string, string | string[] | undefined>;
  apiKey?: ApiKey;
  user?: {
    roles: string[];
    [key: string]: any;
  };
}

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;

  const mockApiKeyService = {
    validateKey: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        { provide: ApiKeyService, useValue: mockApiKeyService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if header is missing (allowing Keycloak check)', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should allow access if key valid and no scopes required', async () => {
    const mockRequest: RequestWithAuth = {
      headers: { 'x-api-key': '1.key' },
    };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const mockKey = {
      id: '1',
      name: 'test',
      scopes: [],
    } as unknown as ApiKey;

    mockApiKeyService.validateKey.mockResolvedValue(mockKey);
    mockReflector.getAllAndOverride.mockReturnValue([]);

    expect(await guard.canActivate(context)).toBe(true);
    expect(mockRequest.apiKey).toBeDefined();
    expect(mockRequest.user).toBeDefined();
  });

  it('should throw ForbiddenException if missing required scope', async () => {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': '1.key' } }),
      }),
    } as unknown as ExecutionContext;

    mockApiKeyService.validateKey.mockResolvedValue({
      id: '1',
      scopes: ['revenue:read'],
    });
    mockReflector.getAllAndOverride.mockReturnValue(['revenue:write']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if all required scopes present', async () => {
    const mockRequest: RequestWithAuth = {
      headers: { 'x-api-key': '1.key' },
    };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    mockApiKeyService.validateKey.mockResolvedValue({
      id: '1',
      name: 'test',
      scopes: ['revenue:read', 'admin'],
    });
    mockReflector.getAllAndOverride.mockReturnValue(['revenue:read']);

    expect(await guard.canActivate(context)).toBe(true);
    expect(mockRequest.user?.roles).toContain('revenue:read');
  });

  it('should handle case-insensitive header', async () => {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'X-API-KEY': '1.key' } }),
      }),
    } as unknown as ExecutionContext;

    mockApiKeyService.validateKey.mockResolvedValue({
      id: '1',
      scopes: [],
    });
    mockReflector.getAllAndOverride.mockReturnValue([]);

    expect(await guard.canActivate(context)).toBe(true);
  });
});
