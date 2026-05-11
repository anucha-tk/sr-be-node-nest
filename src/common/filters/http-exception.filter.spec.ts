/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse as Response,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const status = HttpStatus.BAD_REQUEST;
    const message = 'Bad Request';
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: message,
          code: 'BAD_REQUEST',
        }),
      }),
    );
  });

  it('should handle HttpException with object response missing message and error', () => {
    const status = HttpStatus.BAD_REQUEST;
    const exception = new HttpException({}, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Http Exception', // Fallback to exception.message
          code: 'BAD_REQUEST', // Fallback to HttpStatus[status]
        }),
      }),
    );
  });

  it('should handle HttpException with custom status', () => {
    const status = 499;
    const exception = new HttpException('Custom Error', status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Custom Error',
          code: 'INTERNAL_SERVER_ERROR', // Fallback to code
        }),
      }),
    );
  });

  it('should handle HttpException with string response', () => {
    const status = HttpStatus.FORBIDDEN;
    const message = 'Forbidden Access';
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: message,
          code: 'PERMISSION_DENIED',
        }),
      }),
    );
  });

  it('should handle HttpException with non-object response', () => {
    const status = HttpStatus.UNAUTHORIZED;
    const exception = new HttpException('Unauthorized', status);
    // Mock getResponse to return a string instead of an object if possible
    jest.spyOn(exception, 'getResponse').mockReturnValue('Unauthorized');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Unauthorized',
          code: 'AUTH_REQUIRED',
        }),
      }),
    );
  });

  it('should handle validation exceptions (array message)', () => {
    const status = HttpStatus.BAD_REQUEST;
    const messages = ['error 1', 'error 2'];
    const exception = new HttpException(
      { message: messages, error: 'Bad Request' },
      status,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: messages,
        }),
      }),
    );
  });

  it('should handle generic Error', () => {
    const message = 'Generic Error';
    const exception = new Error(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: message,
          code: 'INTERNAL_SERVER_ERROR',
        }),
      }),
    );
  });

  it('should handle unknown exceptions', () => {
    const exception = 'unknown';

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        }),
      }),
    );
  });
});
