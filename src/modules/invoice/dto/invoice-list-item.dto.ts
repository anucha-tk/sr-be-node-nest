import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const InvoiceListItemSchema = z.object({
  id: z.uuid(),
  invoiceNumber: z.string(),
  amount: z.number(),
  status: z.enum(InvoiceStatus),
  paidAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});

export class InvoiceListItemDto extends createZodDto(InvoiceListItemSchema) {}
