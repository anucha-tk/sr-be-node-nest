import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { validateEnv } from '../../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
    }),
    PrismaModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
