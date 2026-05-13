import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestWithMetadata } from '../interfaces/request-with-metadata.interface';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithMetadata, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Set on request for internal use
    req.correlationId = correlationId;

    // Set on response header for consumer use
    res.set('x-correlation-id', correlationId);

    next();
  }
}
