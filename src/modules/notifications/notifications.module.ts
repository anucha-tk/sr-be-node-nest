import { Module, Global } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { ObservabilityModule } from '../observability/observability.module';

@Global()
@Module({
  imports: [ObservabilityModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
