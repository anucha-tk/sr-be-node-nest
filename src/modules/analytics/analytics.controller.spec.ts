import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return service summary', async () => {
      const mockSummary = {
        totalRevenue: 1000,
        totalPending: 500,
        supplierCount: 10,
      };
      (service.getSummary as jest.Mock).mockResolvedValue(mockSummary);

      const result = await controller.getSummary();

      expect(result).toEqual(mockSummary);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getSummary).toHaveBeenCalled();
    });
  });
});
