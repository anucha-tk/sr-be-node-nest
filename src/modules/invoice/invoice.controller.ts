import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';
import { Roles } from 'nest-keycloak-connect';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';
import { InvoiceListItemDto } from './dto/invoice-list-item.dto';

@ApiTags('Invoices')
@Controller({ path: 'invoices', version: '1' })
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @HttpCode(200)
  @Roles({ roles: ['supplier', 'admin'] })
  @ApiOperation({ summary: 'Get filterable invoice history' })
  @ApiStandardResponse(InvoiceListItemDto, true)
  async findAll(
    @CurrentUser() user: KeycloakUser,
    @Query() query: InvoiceQueryDto,
  ) {
    const isAdmin = user.roles?.includes('admin') ?? false;
    const supplierId = isAdmin ? query.supplierId || null : user.sub;
    const { items, total } = await this.invoiceService.findAll(
      supplierId,
      query,
    );

    return {
      items,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }

  @Post(':id/pay')
  @HttpCode(200)
  @Roles({ roles: ['admin'] })
  @ApiOperation({ summary: 'Pay an invoice (updates DB & emits Kafka event)' })
  @ApiStandardResponse(InvoiceListItemDto)
  async payInvoice(
    @Param('id') id: string,
    @Body() body?: { amount?: number; supplierId?: string },
  ) {
    const amount = body?.amount ?? 500;
    const supplierId = body?.supplierId ?? 'seed-supplier-001';
    return await this.invoiceService.payInvoice(id, amount, supplierId);
  }

  @Get('export')
  @HttpCode(200)
  @Roles({ roles: ['supplier', 'admin'] })
  @ApiOperation({ summary: 'Export invoice history as JSON' })
  @ApiQuery({ name: 'format', enum: ['json'], required: true })
  async exportAll(
    @CurrentUser() user: KeycloakUser,
    @Query() query: InvoiceQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any[]> {
    if (query.format !== 'json') {
      throw new BadRequestException(
        'Invalid format. Only "json" is supported.',
      );
    }

    const isAdmin = user.roles?.includes('admin') ?? false;
    const supplierId = isAdmin ? query.supplierId || null : user.sub;
    const items = await this.invoiceService.exportAll(supplierId, query);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .split('Z')[0];
    const filename = `invoices_export_${timestamp}.json`;

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename=${filename}`,
    });

    return items;
  }
}
