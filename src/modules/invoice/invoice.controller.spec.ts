import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceStatus } from '@prisma/client';

describe('InvoiceController', () => {
  let controller: InvoiceController;

  const mockInvoiceService = {
    findAll: jest.fn(),
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
});
