import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';
import { StandardEnvelope } from '../interfaces/api-response.interface';

describe('ResponseEnvelopeInterceptor', () => {
  let interceptor: ResponseEnvelopeInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseEnvelopeInterceptor<unknown>();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response in standard envelope', (done) => {
    const data = { foo: 'bar' };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ correlationId: 'test-id' }),
        getResponse: () => ({ getHeader: () => undefined }),
      }),
    } as unknown as ExecutionContext;
    const next = {
      handle: () => of(data),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      const enveloped = result as StandardEnvelope<typeof data>;
      expect(enveloped.success).toBe(true);
      expect(enveloped.data).toEqual(data);
      expect(enveloped.meta.timestamp).toBeDefined();
      expect(typeof enveloped.meta.executionTimeMs).toBe('number');
      expect(enveloped.meta.correlationId).toBe('test-id');
      expect(enveloped.error).toBeNull();
      done();
    });
  });

  it('should not wrap Buffer data', (done) => {
    const data = Buffer.from('test');
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ correlationId: 'test-id' }),
        getResponse: () => ({ getHeader: () => undefined }),
      }),
    } as unknown as ExecutionContext;
    const next = {
      handle: () => of(data),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      expect(result).toBe(data);
      expect(Buffer.isBuffer(result)).toBe(true);
      done();
    });
  });

  it('should handle paginated response', (done) => {
    const data = {
      items: [{ id: 1 }],
      total: 100,
      limit: 10,
      offset: 0,
    };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ correlationId: 'test-id' }),
        getResponse: () => ({ getHeader: () => undefined }),
      }),
    } as unknown as ExecutionContext;
    const next = {
      handle: () => of(data),
    } as CallHandler;

    interceptor.intercept(context, next).subscribe((result) => {
      const enveloped = result as StandardEnvelope<any[]>;
      expect(enveloped.success).toBe(true);
      expect(enveloped.data).toEqual(data.items);
      expect(enveloped.meta.pagination).toEqual({
        total: 100,
        limit: 10,
        offset: 0,
      });
      done();
    });
  });
});
