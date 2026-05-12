import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { KAFKA_GROUP_ID } from './modules/kafka/kafka.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cleanup OpenAPI document for nestjs-zod compatibility

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  // OpenAPI / Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('sr-be-node-nest API')
    .setDescription('Supplier Revenue Dashboard Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  cleanupOpenApiDoc(document);

  // Scalar UI setup
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  const configService = app.get(ConfigService);

  // Kafka Microservice Configuration
  try {
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [
            configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
          ],
          clientId:
            configService.get<string>('KAFKA_CLIENT_ID') ?? 'sr-be-revenue',
        },
        consumer: {
          groupId:
            configService.get<string>('KAFKA_GROUP_ID') ?? KAFKA_GROUP_ID,
        },
      },
    });

    await app.startAllMicroservices();
  } catch (error) {
    // Use console if app failed to start
    console.error('Failed to start Kafka microservices:', error);
  }

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
void bootstrap();
