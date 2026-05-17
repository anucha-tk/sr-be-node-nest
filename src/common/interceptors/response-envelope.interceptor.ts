import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestWithMetadata } from '../interfaces/request-with-metadata.interface';
import { StandardEnvelope } from '../interfaces/api-response.interface';

interface MinimalRequest {
  headers?: {
    accept?: string;
  };
}

interface MinimalResponse {
  headersSent?: boolean;
  getHeader?(name: string): string | string[] | undefined;
}

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  StandardEnvelope<T> | T | StreamableFile
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardEnvelope<T> | T | StreamableFile> {
    const startTime = performance.now();

    // 1. If not an HTTP request (e.g., RPC/Kafka microservice or WebSockets), bypass wrapping entirely
    if (context.getType() !== 'http') {
      return next.handle() as Observable<T>;
    }

    return next.handle().pipe(
      map((data: T) => {
        const request = context
          .switchToHttp()
          .getRequest<MinimalRequest & Partial<RequestWithMetadata>>();
        const response = context.switchToHttp().getResponse<MinimalResponse>();

        // 2. Skip wrapping if data is a StreamableFile or Buffer, or if it is an SSE stream request
        if (
          data instanceof StreamableFile ||
          Buffer.isBuffer(data) ||
          request?.headers?.accept === 'text/event-stream' ||
          response?.getHeader?.('content-type') === 'text/event-stream'
        ) {
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

        const correlationId = request?.correlationId || 'unknown';

        const result: StandardEnvelope<T> = {
          success: true,
          data: responseData,
          meta: {
            timestamp: new Date().toISOString(),
            executionTimeMs: performance.now() - startTime,
            pagination,
            correlationId,
          },
          error: null,
        };
        return result;
      }),
    );
  }
}
