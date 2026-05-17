import { Test, TestingModule } from '@nestjs/testing';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { NotificationsGateway } from '../notifications/notifications.gateway';

describe('RevenueController', () => {
  let controller: RevenueController;

  const mockKafkaClient = {
    emit: jest.fn().mockReturnValue(of({})),
  };

  const mockRevenueService = {
    processRevenue: jest.fn().mockResolvedValue(undefined),
    getSupplierBalance: jest.fn(),
  };

  const mockNotificationsGateway = {
    notifySystemPulse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevenueController],
      providers: [
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
        {
          provide: RevenueService,
          useValue: mockRevenueService,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    controller = module.get<RevenueController>(RevenueController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleInvoicePaid', () => {
    const validPayload = {
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      invoiceId: 'INV-001',
      supplierId: 'SUP-001',
      amount: 1000.5,
      currency: 'USD',
      correlationId: '550e8400-e29b-41d4-a716-446655440001',
      timestamp: new Date().toISOString(),
    };

    it('should successfully validate and log valid event', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await controller.handleInvoicePaid(validPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Received ${KAFKA_TOPICS.INVOICE_PAID} event`),
      );
      expect(mockRevenueService.processRevenue).toHaveBeenCalled();
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });

    it('should send to DLQ if validation fails', async () => {
      const invalidPayload = { ...validPayload, amount: -100 }; // Invalid: amount must be positive
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await controller.handleInvoicePaid(invalidPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Validation failed for ${KAFKA_TOPICS.INVOICE_PAID} event`,
        ),
      );
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        KAFKA_TOPICS.INVOICE_PAID_DLQ,
        expect.objectContaining({
          payload: invalidPayload,
          error: expect.any(String) as string,
        }),
      );
    });
  });

  describe('getMeRevenue', () => {
    const mockUser = {
      sub: 'SUP-001',
      preferred_username: 'supplier1',
      roles: ['supplier'],
    };

    it('should return supplier revenue balance', async () => {
      const mockBalance = {
        balance: 1000,
        currency: 'USD',
        metadata: {
          lastUpdated: new Date().toISOString(),
        },
      };
      mockRevenueService.getSupplierBalance = jest
        .fn()
        .mockResolvedValue(mockBalance);

      const result = await controller.getMeRevenue(mockUser);
      expect(result).toEqual(mockBalance);
      expect(mockRevenueService.getSupplierBalance).toHaveBeenCalledWith(
        mockUser.sub,
      );
    });
  });

  describe('simulatePayment', () => {
    const mockUser = {
      sub: 'SUP-001',
      preferred_username: 'supplier1',
      roles: ['admin'],
    };

    it('should simulate payment with default amount when body is not provided', async () => {
      const result = await controller.simulatePayment(mockUser);
      expect(result.data.amount).toBe(500.0);
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        KAFKA_TOPICS.INVOICE_PAID,
        expect.objectContaining({ amount: 500.0 }),
      );
    });

    it('should simulate payment with custom amount when provided in body', async () => {
      const result = await controller.simulatePayment(mockUser, {
        amount: 1500.0,
      });
      expect(result.data.amount).toBe(1500.0);
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        KAFKA_TOPICS.INVOICE_PAID,
        expect.objectContaining({ amount: 1500.0 }),
      );
    });
  });
});
