import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TrendGranularity = z.enum([
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

export const TrendQuerySchema = z.object({
  granularity: TrendGranularity.default('monthly').describe(
    'Grouping period for trend analysis',
  ),
});

export class TrendQueryDto extends createZodDto(TrendQuerySchema) {}
