import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { AnalyticsService } from './analytics.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { TrendQueryDto } from './dto/trend-query.dto';
import { TrendResponseDto } from './dto/trend-response.dto';
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

  @Get('trends')
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Get revenue trend analysis for admins' })
  @ApiStandardResponse(TrendResponseDto)
  async getTrends(@Query() query: TrendQueryDto): Promise<TrendResponseDto> {
    return this.analyticsService.getTrends(query);
  }
}
