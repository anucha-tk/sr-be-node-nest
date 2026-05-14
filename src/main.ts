/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { otelSDK } from './tracing';
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';

import { KAFKA_GROUP_ID } from './modules/kafka/kafka.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-api-key',
  });

  // Cleanup OpenAPI document for nestjs-zod compatibility

  app.useGlobalPipes(new ZodValidationPipe());

  // OpenAPI / Swagger Configuration
  const builder = new DocumentBuilder()
    .setTitle('sr-be-node-nest API')
    .setDescription('Supplier Revenue Dashboard Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .addSecurityRequirements('bearer')
    .addSecurityRequirements('api-key');

  const config = builder.build();

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
