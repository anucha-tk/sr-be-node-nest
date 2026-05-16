import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().min(1).describe('The search query string'),
});

export class SearchQueryDto extends createZodDto(SearchQuerySchema) {}
