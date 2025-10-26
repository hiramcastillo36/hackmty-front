'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRData, UseWebSocketReturn, WebSocketMessage } from '@/types/qr-data';

export function useWebSocket(url: string = 'ws://localhost:8000/ws/qr-data/'): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [qrDataList, setQrDataList] = useState<QRData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);
  const reconnectDelayRef = useRef(3000);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('🔌 Conectando al WebSocket:', url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setError(null);

        // Solicitar último QRData
        ws.send(JSON.stringify({ action: 'get_latest' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Mensaje recibido:', message);

          if (message.type === 'qr_data_created' && message.data) {
            const newData = message.data as QRData;
            setQrDataList((prev) => [newData, ...prev]);
            setTotalCount((prev) => prev + 1);
            setLastUpdate(new Date());
          } else if (message.type === 'latest_qr' && message.data) {
            const latestData = Array.isArray(message.data) ? message.data[0] : (message.data as QRData);
            if (latestData) {
              setQrDataList([latestData]);
              setTotalCount(1);
              setLastUpdate(new Date());
            }
          }
        } catch (err) {
          console.error('Error al procesar mensaje:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ Error en WebSocket:', event);
        setError('Error de conexión con el servidor');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setIsConnected(false);
        attemptReconnect();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error al conectar:', err);
      setError('No se pudo conectar al WebSocket');
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
      reconnectAttemptsRef.current++;
      console.log(`🔄 Intentando reconectar... (${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`);
      setTimeout(() => {
        connect();
      }, reconnectDelayRef.current);
    } else {
      setError('No se pudo conectar al servidor después de varios intentos');
    }
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    qrDataList,
    totalCount,
    lastUpdate,
    connect,
    disconnect,
    sendMessage,
    error,
  };
}
