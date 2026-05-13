/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
const API_KEY = (import.meta.env.VITE_API_KEY as string) || 'sk_live_master';

export interface WebSocketHook {
  isConnected: boolean;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

export const useWebSockets = (): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket
    const socket = io(SOCKET_URL, {
      auth: {
        token: API_KEY, // Sending API Key as token for auth showcase
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('WebSocket connection error:', err.message);
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, callback);

    return () => {
      socketRef.current?.off(event, callback);
    };
  };

  return { isConnected, subscribe };
};
