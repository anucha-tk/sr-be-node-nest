import {
  Controller,
  Get,
  Post,
  Inject,
  Logger,
  HttpCode,
  Body,
} from '@nestjs/common';
import { EventPattern, Payload, ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { InvoicePaidSchema } from './schemas/invoice-paid.schema';
import { RevenueEventDto } from './dto/revenue-event.dto';
import { KAFKA_TOPICS } from '../kafka/kafka.constants';
import { RevenueService } from './revenue.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';
import { RevenueResponseDto } from './dto/revenue-response.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Roles } from 'nest-keycloak-connect';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';
import * as crypto from 'crypto';

interface DuplicateSimulationPayload {
  eventId: string;
  correlationId: string;
  invoiceId: string;
  supplierId: string;
  amount: number;
}

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

  @Get('audit-logs')
  @HttpCode(200)
  @Roles({ roles: ['supplier', 'admin'] })
  @ApiOperation({
    summary: 'Get immutable audit logs for showcase',
  })
  async getAuditLogs(@CurrentUser() user: KeycloakUser) {
    const isAdmin = user.roles?.includes('admin') ?? false;
    // In showcase, we want to see logs. If admin, see all, else see own.
    return this.revenueService.getAuditLogs(isAdmin ? null : user.sub, 20);
  }

  @Post('simulate-payment')
  @HttpCode(202)
  @Roles({ roles: ['admin'] })
  @ApiOperation({
    summary: 'Simulate a payment event sent to Kafka (Showcase purposes)',
  })
  async simulatePayment(@CurrentUser() user: KeycloakUser) {
    const timestamp = new Date().toISOString();
    const eventId = crypto.randomUUID();
    const invoiceId = `inv_sim_${Date.now()}`;
    const supplierId = user?.sub || 'seed-supplier-001';
    const amount = 500.0;

    const payload = {
      eventId,
      correlationId: crypto.randomUUID(),
      invoiceId,
      supplierId,
      amount,
      currency: 'USD',
      status: 'PAID',
      paidAt: timestamp,
      timestamp,
      version: '1.0',
    };

    // Emit event to Kafka (must await firstValueFrom to trigger the Observable)
    await firstValueFrom(
      this.kafkaClient.emit(KAFKA_TOPICS.INVOICE_PAID, payload),
    );

    this.logger.log(`Simulated payment event sent to Kafka: ${eventId}`);

    return {
      success: true,
      message: 'Payment simulation event dispatched to Kafka',
      data: payload,
    };
  }

  @Post('simulate-duplicate')
  @HttpCode(200)
  @Roles({ roles: ['admin'] })
  @ApiOperation({
    summary: 'Simulate a duplicate payment processing (Direct service call)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        correlationId: { type: 'string' },
        invoiceId: { type: 'string' },
        supplierId: { type: 'string' },
        amount: { type: 'number' },
      },
    },
  })
  async simulateDuplicate(@Body() payload: DuplicateSimulationPayload) {
    const dto: RevenueEventDto = {
      eventId: payload.eventId,
      correlationId: payload.correlationId,
      invoiceId: payload.invoiceId,
      supplierId: payload.supplierId,
      amount: payload.amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };

    const result = await this.revenueService.processRevenue(dto);

    return {
      success: true,
      data: result,
    };
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
