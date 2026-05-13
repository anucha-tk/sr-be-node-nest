import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TrendItemSchema = z.object({
  label: z.string().describe('Period label (e.g., "2026-01" or "2026-05-13")'),
  value: z.number().describe('Aggregated revenue for this period'),
});

export const TrendComparisonSchema = z.object({
  previousValue: z
    .number()
    .describe('Total revenue for the previous period of same duration'),
  currentValue: z.number().describe('Total revenue for the current period'),
  growthPercentage: z.number().describe('Percentage growth between periods'),
});

export const TrendResponseSchema = z.object({
  trends: z
    .array(TrendItemSchema)
    .describe('List of trend data points for charting'),
  comparison: TrendComparisonSchema.describe(
    'Period-over-period comparison metrics',
  ),
});

export class TrendResponseDto extends createZodDto(TrendResponseSchema) {}
export class TrendItemDto extends createZodDto(TrendItemSchema) {}
