import { Request } from 'express';

export interface RequestWithMetadata extends Request {
  correlationId?: string;
  user?: {
    sub: string;
    [key: string]: any;
  };
}
