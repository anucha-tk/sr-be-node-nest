import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';

@ApiTags('Analytics')
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Get global financial summary for admins' })
  @ApiStandardResponse(AdminSummaryDto)
  async getSummary(): Promise<AdminSummaryDto> {
    return this.analyticsService.getSummary();
  }
}
