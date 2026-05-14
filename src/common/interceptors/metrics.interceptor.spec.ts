/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsInterceptor } from './metrics.interceptor';
import { getToken } from '@willsoto/nestjs-prometheus';
import { of } from 'rxjs';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;
  const mockCounter = {
    inc: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsInterceptor,
        {
          provide: getToken('http_requests_total'),
          useValue: mockCounter,
        },
      ],
    }).compile();

    interceptor = module.get<MetricsInterceptor>(MetricsInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should increment counter on successful request', (done) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', path: '/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;

    const next = {
      handle: () => of({ success: true }),
    } as any;

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockCounter.inc).toHaveBeenCalledWith({
          method: 'GET',
          path: '/test',
          status: '200',
        });
        done();
      },
    });
  });
});
