import { Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Observable } from 'rxjs';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from 'nest-keycloak-connect';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Activity')
@Controller({ path: 'activity', version: '1' })
@SkipThrottle()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Sse('stream')
  @Public()
  @ApiOperation({ summary: 'Stream live system activity events (SSE)' })
  @ApiQuery({
    name: 'type',
    required: false,
    description:
      'Filter events by type (KAFKA_PRODUCED, KAFKA_CONSUMED, DB_COMMIT)',
  })
  stream(@Query('type') type?: string): Observable<MessageEvent> {
    return this.activityService.getStream(type);
  }
}
