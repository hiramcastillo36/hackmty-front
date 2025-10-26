/**
 * Hook para conectar al WebSocket y recibir QR data en tiempo real
 * SIMPLIFICADO: Solo recibe mensajes del WebSocket
 * Endpoints utilizados:
 * - WebSocket: ws://localhost:8000/ws/trolley/ (qr_data_created messages)
 * - REST: /api/trolleys/{id}/required-contents/ (via useTrolleyContents)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRDataV1 } from '@/types/api';

export interface UseTrolleyWebSocketReturn {
  isConnected: boolean;
  lastQRData: QRDataV1 | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
  onQRDataReceived?: (callback: (qrData: QRDataV1) => void) => void;
}

export function useTrolleyWebSocket(
  url: string = 'ws://localhost:8000/ws/qr-data/',
): UseTrolleyWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastQRData, setLastQRData] = useState<QRDataV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(3);
  const reconnectDelayRef = useRef(2000);
  const qrDataCallbackRef = useRef<((qrData: QRDataV1) => void) | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      console.log('🔌 Conectando al WebSocket:', url);
      const ws = new WebSocket(url);

      // Timeout: si no se conecta en 3 segundos, continuar sin WebSocket
      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.warn('⏱️ WebSocket timeout - continuando sin conexión en tiempo real');
          ws.close();
          setIsLoading(false);
        }
      }, 3000);

      ws.onopen = () => {
        console.log('✅ WebSocket conectado');
        clearTimeout(timeout);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setError(null);
        setIsLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Mensaje recibido:', message.type);

          if (message.type === 'qr_data_created' && message.data) {
            const qrData = message.data as QRDataV1;
            console.log('🎫 QR Data recibido del WebSocket:', {
              flight: qrData.flight_number,
              customer: qrData.customer_name,
              drawer: qrData.drawer_id,
              trolleys: qrData.trolley_ids,
            });

            setLastQRData(qrData);

            // Llamar al callback si está registrado
            if (qrDataCallbackRef.current) {
              qrDataCallbackRef.current(qrData);
            }
          } else if (message.type === 'error') {
            console.error('Error del servidor:', message.message);
            setError(message.message || 'Error desconocido');
          }
        } catch (err) {
          console.error('Error al procesar mensaje WebSocket:', err);
        }
      };

      ws.onerror = () => {
        console.warn('⚠️ Error en WebSocket - continuando sin conexión en tiempo real');
        clearTimeout(timeout);
        setError(null);
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        clearTimeout(timeout);
        setIsConnected(false);
        attemptReconnect();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error al conectar:', err);
      setError('No se pudo conectar al WebSocket');
      setIsLoading(false);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
      setLastQRData(null);
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
      reconnectAttemptsRef.current++;
      console.log(
        `🔄 Intentando reconectar WebSocket... (${reconnectAttemptsRef.current}/${maxReconnectAttemptsRef.current})`,
      );
      setTimeout(() => {
        connect();
      }, reconnectDelayRef.current);
    } else {
      setError('No se pudo conectar al servidor después de varios intentos');
      setIsLoading(false);
    }
  }, [connect]);

  // Conectar automáticamente al montar el componente
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const onQRDataReceived = useCallback((callback: (qrData: QRDataV1) => void) => {
    qrDataCallbackRef.current = callback;
  }, []);

  return {
    isConnected,
    lastQRData,
    error,
    connect,
    disconnect,
    isLoading,
    onQRDataReceived,
  };
}
