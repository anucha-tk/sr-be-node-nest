import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KAFKA_CLIENT_ID, KAFKA_GROUP_ID } from './kafka.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9092',
              ],
              clientId:
                configService.get<string>('KAFKA_CLIENT_ID') ?? KAFKA_CLIENT_ID,
            },
            consumer: {
              groupId:
                configService.get<string>('KAFKA_GROUP_ID') ?? KAFKA_GROUP_ID,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
