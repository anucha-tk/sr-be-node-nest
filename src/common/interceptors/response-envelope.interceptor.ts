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

        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            executionTimeMs: parseFloat(
              (performance.now() - startTime).toFixed(3),
            ),
          },
          error: null,
        };
      }),
    );
  }
}
