export interface ResponseMeta {
  timestamp: string;
  executionTimeMs: number;
  correlationId: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  } | null;
}

export interface ResponseError {
  code: string;
  message: string;
  details?: unknown[];
}

export interface StandardEnvelope<T> {
  success: boolean;
  data: T | null;
  meta: ResponseMeta;
  error: ResponseError | null;
}
