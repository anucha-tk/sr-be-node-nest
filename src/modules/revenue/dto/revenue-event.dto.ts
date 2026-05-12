import { createZodDto } from 'nestjs-zod';
import { InvoicePaidSchema } from '../schemas/invoice-paid.schema';

/**
 * RevenueEventDto mapped from Kafka event
 */
export class RevenueEventDto extends createZodDto(InvoicePaidSchema) {}
