import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService, ActivityEvent } from './activity.service';
import { firstValueFrom, take } from 'rxjs';

describe('ActivityController & ActivityService', () => {
  let controller: ActivityController;
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('stream', () => {
    it('should stream activity events to client', async () => {
      const stream$ = controller.stream();
      const promise = firstValueFrom(stream$.pipe(take(1)));

      service.emit({
        type: 'KAFKA_PRODUCED',
        label: 'Test Event 1',
      });

      const result = await promise;
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      const data = result.data as ActivityEvent;
      expect(data.type).toBe('KAFKA_PRODUCED');
      expect(data.label).toBe('Test Event 1');
      expect(data.timestamp).toBeDefined();
    });

    it('should filter stream based on event type query param', async () => {
      const stream$ = controller.stream('KAFKA_CONSUMED');
      const promise = firstValueFrom(stream$.pipe(take(1)));

      // Emit non-matching event first
      service.emit({
        type: 'KAFKA_PRODUCED',
        label: 'Should be ignored',
      });

      // Emit matching event
      service.emit({
        type: 'KAFKA_CONSUMED',
        label: 'Should match filter',
      });

      const result = await promise;
      const data = result.data as ActivityEvent;
      expect(data.type).toBe('KAFKA_CONSUMED');
      expect(data.label).toBe('Should match filter');
    });
  });
});
