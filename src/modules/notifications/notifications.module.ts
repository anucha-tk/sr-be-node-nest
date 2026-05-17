import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ObservabilityModule } from '../observability/observability.module';

@Global()
@Module({
  imports: [ObservabilityModule],
  controllers: [ActivityController],
  providers: [NotificationsGateway, ActivityService],
  exports: [NotificationsGateway, ActivityService],
})
export class NotificationsModule {}
