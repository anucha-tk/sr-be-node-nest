import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from '@prisma/client';
import { InvoiceQueryDto } from './dto/invoice-query.dto';

describe('InvoiceController', () => {
  let controller: InvoiceController;

  const mockInvoiceService = {
    findAll: jest.fn(),
    exportAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockUser = {
      sub: 'SUP-001',
      preferred_username: 'supplier1',
      roles: ['supplier'],
    };

    const mockQuery = {
      limit: 10,
      offset: 0,
      status: InvoiceStatus.PAID,
    };

    it('should return paginated invoices', async () => {
      const mockResult = {
        items: [
          {
            id: 'uuid-1',
            invoiceNumber: 'INV-001',
            amount: 100,
            status: InvoiceStatus.PAID,
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      };
      mockInvoiceService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockUser, mockQuery);

      expect(result).toEqual({
        items: mockResult.items,
        total: 1,
        limit: 10,
        offset: 0,
      });
      expect(mockInvoiceService.findAll).toHaveBeenCalledWith(
        mockUser.sub,
        expect.objectContaining(mockQuery),
      );
    });
  });

  describe('exportAll', () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method */
    const mockUser = {
      sub: 'SUP-001',
      preferred_username: 'supplier1',
      roles: ['supplier'],
    };

    const mockQuery = {
      status: InvoiceStatus.PAID,
      format: 'json',
      limit: 10,
      offset: 0,
    } as InvoiceQueryDto;

    it('should set headers and return data for export', async () => {
      const mockItems = [
        {
          id: 'uuid-1',
          invoiceNumber: 'INV-001',
          amount: 100,
          status: InvoiceStatus.PAID,
          paidAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
      mockInvoiceService.exportAll.mockResolvedValue(mockItems);

      const mockRes = {
        set: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.exportAll(mockUser, mockQuery, mockRes);

      expect(mockRes.set).toHaveBeenCalledWith({
        'Content-Type': 'application/json',
        'Content-Disposition': expect.stringContaining(
          'attachment; filename=invoices_export_',
        ),
      });

      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
      expect(mockInvoiceService.exportAll).toHaveBeenCalledWith(
        mockUser.sub,
        expect.objectContaining(mockQuery),
      );
    });

    it('should throw BadRequestException if format is invalid', async () => {
      const invalidQuery = { format: 'csv' } as unknown as InvoiceQueryDto;
      const mockRes = {} as unknown as Response;
      await expect(
        controller.exportAll(mockUser, invalidQuery, mockRes),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
