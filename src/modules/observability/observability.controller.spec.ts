/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { ObservabilityController } from './observability.controller';
import { getToken } from '@willsoto/nestjs-prometheus';

describe('ObservabilityController', () => {
  let controller: ObservabilityController;

  const mockGauge = {
    get: jest.fn().mockResolvedValue({
      values: [{ value: 5 }],
    }),
  };

  const mockCounter = {
    get: jest.fn().mockResolvedValue({
      values: [{ value: 100 }],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservabilityController],
      providers: [
        {
          provide: getToken('active_socket_connections'),
          useValue: mockGauge,
        },
        {
          provide: getToken('http_requests_total'),
          useValue: mockCounter,
        },
      ],
    }).compile();

    controller = module.get<ObservabilityController>(ObservabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return metrics summary with real calculations', async () => {
    // First call to establish baseline
    await controller.getMetricsSummary();

    // Fast-forward time slightly
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);

    const result = await controller.getMetricsSummary();

    expect(result).toMatchObject({
      cpu: expect.objectContaining({
        usage: expect.any(Number),
        loadAvg: expect.any(Number),
      }),
      memory: expect.objectContaining({
        heapUsed: expect.any(Number),
      }),
      network: expect.objectContaining({
        activeConnections: 5,
        requestsPerSecond: expect.any(Number),
      }),
      timestamp: expect.any(String),
    });
  });

  it('should handle zero time delta', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);
    await controller.getMetricsSummary();

    // Same timestamp
    const result = await controller.getMetricsSummary();
    expect(result.cpu.usage).toBe(0);
    expect(result.network.requestsPerSecond).toBe(0);
  });
});
