import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchStatsQuerySchema = z.object({
  q: z.string().optional().describe('Search query for text fields'),
  status: z.string().optional().describe('Filter by status'),
  supplierName: z.string().optional().describe('Filter by supplier name'),
  granularity: z
    .enum(['daily', 'weekly', 'monthly', 'yearly'])
    .default('monthly')
    .describe('Date histogram granularity'),
});

export const SearchStatsStatsSchema = z.object({
  count: z.number(),
  sum: z.number(),
  avg: z.number(),
  min: z.number(),
  max: z.number(),
});

export const FacetItemSchema = z.object({
  key: z.string(),
  docCount: z.number(),
});

export const SearchStatsTrendsSchema = z.object({
  period: z.string(),
  count: z.number(),
  amount: z.number(),
});

export const SearchStatsResponseSchema = z.object({
  stats: SearchStatsStatsSchema,
  facets: z.object({
    status: z.array(FacetItemSchema),
    supplierName: z.array(FacetItemSchema),
  }),
  trends: z.array(SearchStatsTrendsSchema),
});

export class SearchStatsQueryDto extends createZodDto(SearchStatsQuerySchema) {}
export class SearchStatsResponseDto extends createZodDto(
  SearchStatsResponseSchema,
) {}
