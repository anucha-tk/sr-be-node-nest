import {
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

interface RequestWithUser {
  headers: Record<string, string | string[] | undefined>;
  user?: { sub?: string };
  ip?: string;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    await Promise.resolve();
    const request = req as unknown as RequestWithUser;

    // API Key tracker
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      return `api-key:${String(apiKey)}`;
    }

    // User tracker (from JWT)
    if (request.user?.sub) {
      return `user:${request.user.sub}`;
    }

    // Fallback to IP
    return `ip:${request.ip || 'unknown'}`;
  }

  protected override async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    await Promise.resolve({ context, throttlerLimitDetail });
    throw new HttpException(
      {
        success: false,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          executionTimeMs: 0,
        },
        error: {
          code: 'THROTTLED',
          message: 'Rate limit exceeded. Please try again later.',
          details: [],
        },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
