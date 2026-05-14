import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  onModuleInit() {
    // We can't emit immediately because the server might not be ready.
    // Use a small timeout or wait for something else.
    setTimeout(() => {
      this.notifySystemPulse({
        type: 'TRACE_STARTED',
        label: 'System Monitoring Started',
        metadata: { version: '1.0.0' },
      });
    }, 3000);
  }

  handleConnection(client: Socket) {
    const { token } = client.handshake.auth;

    // For the showcase, we'll log the connection.
    // In a full production app, we would verify the JWT here.
    if (!token) {
      this.logger.warn(
        `Client ${client.id} connected without token. Disconnecting.`,
      );
      client.disconnect();
      return;
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyAuditLog(payload: any) {
    this.server.emit('audit_log_created', payload);
  }

  notifyBalanceUpdate(payload: any) {
    this.server.emit('balance_updated', payload);
  }

  notifySystemPulse(payload: {
    type: string;
    label: string;
    timestamp?: string;
    metadata?: Record<string, any>;
  }) {
    this.server.emit('system_pulse', {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
    });
  }
}
