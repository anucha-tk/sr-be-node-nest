import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/sr_be_db'),

  // Keycloak
  KEYCLOAK_PORT: z.coerce.number().default(8080),
  KEYCLOAK_ISSUER_URL: z.url().default('http://localhost:8080/realms/sr-realm'),
  KEYCLOAK_CLIENT_ID: z.string().default('sr-be-client'),

  // Kafka
  KAFKA_BROKERS: z
    .string()
    .regex(/^[a-zA-Z0-9.-]+:[0-9]+(,[a-zA-Z0-9.-]+:[0-9]+)*$/)
    .default('localhost:9092'),
  KAFKA_CONSUMER_GROUP_ID: z.string().default('sr-consumer-group'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = envSchema.safeParse(config);

  if (!validatedConfig.success) {
    const errorDetails = JSON.stringify(
      z.treeifyError(validatedConfig.error),
      null,
      2,
    );
    throw new Error(`❌ Invalid environment variables: ${errorDetails}`);
  }
  return validatedConfig.data;
}
