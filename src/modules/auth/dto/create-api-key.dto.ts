import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AllowedScopes = z.enum([
  'revenue:read',
  'revenue:write',
  'invoices:read',
  'invoices:write',
  'admin',
]);

export const CreateApiKeySchema = z.object({
  name: z.string().min(3).max(50),
  scopes: z.array(AllowedScopes).default([]),
});

export class CreateApiKeyDto extends createZodDto(CreateApiKeySchema) {}
