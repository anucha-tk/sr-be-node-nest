import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AdminSummarySchema = z.object({
  totalRevenue: z.number().describe('Total sum of all PAID invoices'),
  totalPending: z.number().describe('Total sum of all PENDING invoices'),
  supplierCount: z.number().describe('Total count of distinct suppliers'),
});

export class AdminSummaryDto extends createZodDto(AdminSummarySchema) {}
