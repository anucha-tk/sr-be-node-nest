import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { SkipThrottle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { AdminSummaryDto } from './dto/admin-summary.dto';
import { TrendQueryDto } from './dto/trend-query.dto';
import { TrendResponseDto } from './dto/trend-response.dto';
import {
  SearchStatsQueryDto,
  SearchStatsResponseDto,
} from './dto/search-stats.dto';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';

@ApiTags('Analytics')
@SkipThrottle()
@Controller({ path: 'analytics', version: '1' })
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

  @Get('search-stats')
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Get advanced search aggregation statistics' })
  @ApiStandardResponse(SearchStatsResponseDto)
  async getSearchStats(
    @Query() query: SearchStatsQueryDto,
  ): Promise<SearchStatsResponseDto> {
    return this.analyticsService.getSearchStats(query);
  }
}
