import { Request } from 'express';
import { ApiKey } from '@prisma/client';

export interface RequestWithAuth extends Request {
  apiKey?: ApiKey;
  user?: {
    sub: string;
    name: string;
    roles: string[];
    realm_access?: { roles: string[] };
    resource_access?: Record<string, { roles: string[] }>;
  };
  isApiKeyAuthenticated?: boolean;
}
