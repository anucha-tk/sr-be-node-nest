import { z } from 'zod';

/**
 * Zod schema for invoice.paid event payload
 * Following project-context rules: correlationId and timestamp are mandatory.
 */
export const InvoicePaidSchema = z.object({
  eventId: z.string().uuid(),
  invoiceId: z.string(),
  supplierId: z.string(),
  amount: z.number().positive(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/, 'Must be a valid 3-letter ISO currency code'),
  correlationId: z.string().uuid(),
  timestamp: z.string().datetime(), // ISO 8601 UTC
});

export type InvoicePaidEvent = z.infer<typeof InvoicePaidSchema>;
