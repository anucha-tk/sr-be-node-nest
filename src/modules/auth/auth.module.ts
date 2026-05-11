import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { AuthTestController } from './controllers/auth-test.controller';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const issuerUrl = config.get<string>('KEYCLOAK_ISSUER_URL');
        if (!issuerUrl) {
          throw new Error('KEYCLOAK_ISSUER_URL is not defined');
        }
        const url = new URL(issuerUrl);
        const authServerUrl = url.origin;
        const realm = url.pathname.split('/').pop() || 'sr-realm';

        return {
          authServerUrl,
          realm,
          clientId: config.get<string>('KEYCLOAK_CLIENT_ID'),
          secret: 'public', // public client or specify dummy
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthTestController],
  providers: [],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
