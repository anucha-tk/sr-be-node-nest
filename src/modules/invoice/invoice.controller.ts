import { Controller, Get, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { KeycloakUser } from '../auth/interfaces/keycloak-user.interface';
import { Roles } from 'nest-keycloak-connect';
import { ApiStandardResponse } from '../../common/docs/api-response.decorator';
import { InvoiceListItemDto } from './dto/invoice-list-item.dto';

@ApiTags('Invoices')
@Controller('v1/invoices')
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
    const { items, total } = await this.invoiceService.findAll(user.sub, query);

    return {
      items,
      total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
