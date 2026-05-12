import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RevenueResponseSchema = z.object({
  balance: z.number(),
  currency: z.string(),
  metadata: z.object({
    lastUpdated: z.iso.datetime(),
  }),
});

export class RevenueResponseDto extends createZodDto(RevenueResponseSchema) {}
