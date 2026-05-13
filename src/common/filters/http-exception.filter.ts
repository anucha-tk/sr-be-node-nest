import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithMetadata } from '../interfaces/request-with-metadata.interface';
import { StandardEnvelope } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithMetadata>();
    const correlationId = request.correlationId || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        const errorVal = resObj.error || resObj.code;
        if (typeof errorVal === 'string') {
          code = errorVal.toUpperCase().replace(/\s/g, '_');
        }

        if (Array.isArray(resObj.message)) {
          details = resObj.message;
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = exception.message;
      }

      // Final mapping of status codes to specific business codes if not already set
      const isDefaultCode =
        code === 'INTERNAL_SERVER_ERROR' ||
        code === HttpStatus[status] ||
        code === (HttpStatus[status] || '').replace(/_/g, ' ');

      if (isDefaultCode) {
        switch (status) {
          case HttpStatus.UNAUTHORIZED:
            code = 'AUTH_REQUIRED';
            break;
          case HttpStatus.FORBIDDEN:
            code = 'PERMISSION_DENIED';
            break;
          case HttpStatus.NOT_FOUND:
            code = 'RESOURCE_NOT_FOUND';
            break;
          case HttpStatus.TOO_MANY_REQUESTS:
            code = 'ERR_RATE_LIMIT_EXCEEDED';
            break;
          case HttpStatus.BAD_REQUEST:
            code = 'INVALID_REQUEST';
            break;
          default:
            code = (
              HttpStatus[status] || 'INTERNAL_SERVER_ERROR'
            ).toUpperCase();
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // You could add logging for unhandled errors here
    }

    const body: StandardEnvelope<null> = {
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        executionTimeMs: 0,
        correlationId,
      },
      error: {
        code,
        message,
        details,
      },
    };

    response.status(status).json(body);
  }
}
