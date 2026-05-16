import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('should return validated config if valid', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sr_be_db',
      GLOBAL_THROTTLE_TTL: '60',
      GLOBAL_THROTTLE_LIMIT: '100',
      KEYCLOAK_PORT: '8080',
      KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/sr-realm',
      KEYCLOAK_CLIENT_ID: 'sr-be-client',
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'sr-consumer-group',
    };
    const result = validateEnv(config);
    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/sr_be_db',
      GLOBAL_THROTTLE_TTL: 60,
      GLOBAL_THROTTLE_LIMIT: 100,
      KEYCLOAK_PORT: 8080,
      KEYCLOAK_ISSUER_URL: 'http://localhost:8080/realms/sr-realm',
      KEYCLOAK_CLIENT_ID: 'sr-be-client',
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CONSUMER_GROUP_ID: 'sr-consumer-group',
      ELASTICSEARCH_NODE: 'http://localhost:9200',
    });
  });

  it('should use defaults if not provided', () => {
    const config = {
      // Missing values that have defaults
    };
    const result = validateEnv(config);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
  });

  it('should throw error if invalid', () => {
    const config = {
      NODE_ENV: 'invalid',
    };
    expect(() => validateEnv(config)).toThrow();
  });

  it('should throw error if invalid URL', () => {
    const config = {
      DATABASE_URL: 'not-a-url',
    };
    expect(() => validateEnv(config)).toThrow();
  });

  it('should throw error if invalid Kafka brokers', () => {
    const config = {
      KAFKA_BROKERS: 'invalid_format',
    };
    expect(() => validateEnv(config)).toThrow();
  });
});
