import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.url(),

  // Keycloak
  KEYCLOAK_PORT: z.coerce.number().default(8080),
  KEYCLOAK_ISSUER_URL: z.url(),
  KEYCLOAK_CLIENT_ID: z.string(),

  // Kafka
  KAFKA_BROKERS: z.string(),
  KAFKA_CONSUMER_GROUP_ID: z.string(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = envSchema.safeParse(config);

  if (!validatedConfig.success) {
    console.error(
      '❌ Invalid environment variables:',
      z.treeifyError(validatedConfig.error),
    );
    process.exit(1);
  }
  return validatedConfig.data;
}
