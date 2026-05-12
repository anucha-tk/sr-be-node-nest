import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RevenueModule } from './modules/revenue/revenue.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { UnifiedAuthGuard } from './common/guards/unified-auth.guard';
import { UnifiedRoleGuard } from './common/guards/unified-role.guard';
import { UnifiedResourceGuard } from './common/guards/unified-resource.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV');
        const isProduction = nodeEnv === 'production';

        return {
          pinoHttp: {
            transport: !isProduction ? { target: 'pino-pretty' } : undefined,
            level: !isProduction ? 'debug' : 'info',
          },
        };
      },
    }),
    AuthModule,
    PrismaModule,
    RevenueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UnifiedAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UnifiedResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UnifiedRoleGuard,
    },
  ],
})
export class AppModule {}
