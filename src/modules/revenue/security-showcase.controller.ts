import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { Public } from 'nest-keycloak-connect';

@ApiTags('Security Showcase')
@Controller({ path: 'security-showcase', version: '1' })
export class SecurityShowcaseController {
  private readonly logger = new Logger(SecurityShowcaseController.name);

  @Get('rate-limit-test')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Endpoint to demonstrate rate limiting' })
  testRateLimit() {
    this.logger.log('Rate limit test endpoint called');
    return {
      message: 'Request successful! You have not hit the rate limit yet.',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('no-limit')
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'Endpoint with no rate limiting' })
  noLimit() {
    return { message: 'This endpoint has no rate limit' };
  }
}
