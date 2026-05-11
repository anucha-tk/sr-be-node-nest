import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message = (resObj.message as string) || exception.message;
        code = (resObj.error as string) || code;

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
      if (code === 'INTERNAL_SERVER_ERROR' || code === HttpStatus[status]) {
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
          default:
            code = HttpStatus[status] || 'INTERNAL_SERVER_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // You could add logging for unhandled errors here
    }

    response.status(status).json({
      success: false,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        executionTimeMs: 0,
      },
      error: {
        code,
        message,
        details,
      },
    });
  }
}
