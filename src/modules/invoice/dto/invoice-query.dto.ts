import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const InvoiceQuerySchema = z.object({
  status: z.enum(InvoiceStatus).optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  sort: z.string().optional(),
  format: z.enum(['json']).optional(),
  supplierId: z.string().optional(),
});

export class InvoiceQueryDto extends createZodDto(InvoiceQuerySchema) {}
