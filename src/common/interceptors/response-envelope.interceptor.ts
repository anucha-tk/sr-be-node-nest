import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    executionTimeMs: number;
    pagination?: {
      limit: number;
      offset: number;
      total: number;
    } | null;
  };
  error: null;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T> | T | StreamableFile
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T> | T | StreamableFile> {
    const startTime = performance.now();

    return next.handle().pipe(
      map((data: T) => {
        // Skip wrapping if data is a StreamableFile or Buffer
        if (data instanceof StreamableFile || Buffer.isBuffer(data)) {
          return data;
        }

        // Handle pagination if present in data
        let pagination: {
          limit: number;
          offset: number;
          total: number;
        } | null = null;
        let responseData = data;

        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data
        ) {
          const paginated = data as {
            items: T;
            total: number;
            limit?: number;
            offset?: number;
          };
          responseData = paginated.items;
          pagination = {
            limit: paginated.limit ?? 0,
            offset: paginated.offset ?? 0,
            total: paginated.total ?? 0,
          };
        }

        return {
          success: true,
          data: responseData,
          meta: {
            timestamp: new Date().toISOString(),
            executionTimeMs: parseFloat(
              (performance.now() - startTime).toFixed(3),
            ),
            pagination,
          },
          error: null,
        };
      }),
    );
  }
}
