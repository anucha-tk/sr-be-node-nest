import { Controller, Get, Inject, Logger, HttpCode } from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InvoicePaidSchema } from './schemas/invoice-paid.schema';
import { RevenueEventDto } from './dto/revenue-event.dto';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { RevenueService } from './revenue.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';
import { RevenueResponseDto } from './dto/revenue-response.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';

@ApiTags('Revenue')
@Controller('v1/suppliers')
export class RevenueController {
  private readonly logger = new Logger(RevenueController.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly revenueService: RevenueService,
  ) {}

  @Get('me/revenue')
  @HttpCode(200)
  @Roles({ roles: ['supplier', 'admin'] })
  @ApiOperation({
    summary: 'Get current revenue balance for the authenticated supplier',
  })
  @ApiStandardResponse(RevenueResponseDto)
  async getMeRevenue(
    @CurrentUser() user: KeycloakUser,
  ): Promise<RevenueResponseDto> {
    return this.revenueService.getSupplierBalance(user.sub);
  }

  @EventPattern(KAFKA_TOPICS.INVOICE_PAID)
  async handleInvoicePaid(@Payload() data: unknown) {
    try {
      // Validate with Zod
      const validated = InvoicePaidSchema.parse(data);

      // Map to DTO for type safety in subsequent steps
      const dto: RevenueEventDto = validated;

      this.logger.log(
        `Received ${KAFKA_TOPICS.INVOICE_PAID} event: ${dto.eventId} (Correlation: ${dto.correlationId})`,
      );

      // Process revenue with idempotency and atomic updates
      await this.revenueService.processRevenue(dto);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Validation failed for ${KAFKA_TOPICS.INVOICE_PAID} event: ${errorMessage}`,
      );

      // Route to DLQ
      await firstValueFrom(
        this.kafkaClient.emit(KAFKA_TOPICS.INVOICE_PAID_DLQ, {
          payload: data,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}
