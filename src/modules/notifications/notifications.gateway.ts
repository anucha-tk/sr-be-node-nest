/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { trace, context } from '@opentelemetry/api';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Gauge } from 'prom-client';

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

  constructor(
    @InjectMetric('active_socket_connections')
    private readonly socketGauge: Gauge<string>,
  ) {}

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
    this.socketGauge.inc();
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.socketGauge.dec();
  }

  notifyAuditLog(payload: any) {
    this.server.emit('audit_log_created', payload);
  }

  notifyBalanceUpdate(payload: any) {
    this.server.emit('balance_updated', payload);
  }

  notifySystemPulse(data: any): void {
    const span = trace.getSpan(context.active());
    const traceId = span?.spanContext().traceId;

    const payload = {
      ...data,
      traceId,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('system_pulse', payload);
  }
}
