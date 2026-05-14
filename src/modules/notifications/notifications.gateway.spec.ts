/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { Server, Socket } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let server: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);

    server = { emit: jest.fn() } as unknown as Server;
    gateway.server = server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should disconnect if no token provided', () => {
      const client = {
        id: '123',
        handshake: { auth: {} },
        disconnect: jest.fn(),
      } as unknown as Socket;

      gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should log connection if token provided', () => {
      const client = {
        id: '123',
        handshake: { auth: { token: 'valid' } },
        disconnect: jest.fn(),
      } as unknown as Socket;

      gateway.handleConnection(client);
      expect(client.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnect', () => {
      const client = { id: '123' } as unknown as Socket;
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(client);
      expect(loggerSpy).toHaveBeenCalledWith('Client disconnected: 123');
    });
  });

  describe('notifications', () => {
    it('should emit audit_log_created', () => {
      const payload = { id: 1 };
      gateway.notifyAuditLog(payload);
      expect(server.emit).toHaveBeenCalledWith('audit_log_created', payload);
    });

    it('should emit balance_updated', () => {
      const payload = { balance: 100 };
      gateway.notifyBalanceUpdate(payload);
      expect(server.emit).toHaveBeenCalledWith('balance_updated', payload);
    });

    it('should emit system_pulse', () => {
      const payload = {
        type: 'KAFKA_PRODUCED',
        label: 'Test',
        timestamp: '2021-01-01T00:00:00Z',
      };
      gateway.notifySystemPulse(payload);
      expect(server.emit).toHaveBeenCalledWith(
        'system_pulse',
        expect.objectContaining({
          type: 'KAFKA_PRODUCED',
          label: 'Test',
          timestamp: expect.any(String) as unknown,
        }),
      );
    });
  });
});
