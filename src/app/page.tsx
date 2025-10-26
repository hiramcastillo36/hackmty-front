"use client"

import { useEffect } from "react"
import TrolleyManager from "@/components/trolley-manager"
import { useTrolleyWebSocket } from "@/hooks/useTrolleyWebSocket"
import { Card } from "@/components/ui/card"
import { Loader } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const { isConnected, lastQRData, error: wsError, isLoading } = useTrolleyWebSocket()

  // Debug: Log cuando cambia lastQRData
  useEffect(() => {
    if (lastQRData) {
      console.log('📱 Page.tsx - lastQRData actualizado:', {
        flight: lastQRData.flight_number,
        customer: lastQRData.customer_name,
        trolleyIds: lastQRData.trolley_ids,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Debug: ver la estructura completa
      console.log('🔍 Estructura completa de lastQRData:', {
        id: lastQRData.id,
        flight_number: lastQRData.flight_number,
        customer_name: lastQRData.customer_name,
        drawer_id: lastQRData.drawer_id,
        trolley_ids: lastQRData.trolley_ids,
        trolleys: lastQRData.trolleys,
        hasArrayElements: lastQRData.trolley_ids ? lastQRData.trolley_ids.length : 0,
      });
    }
  }, [lastQRData]);

  // Pantalla de carga WebSocket
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader className="w-8 h-8 text-primary" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Conectando al servidor...
            </p>
          </div>
        </motion.div>
      </main>
    )
  }

  // Si hay QR data, mostrar TrolleyManager con el trolley_id
  if (lastQRData && lastQRData.trolley_ids && lastQRData.trolley_ids.length > 0) {
    const currentTrolleyId = lastQRData.trolley_ids[0];
    const qrId = lastQRData.id;
    const drawerId = lastQRData.drawer_id;

    console.log('✅ Page renderizado con QR Data válido:', {
      flight: lastQRData.flight_number,
      customer: lastQRData.customer_name,
      trolleyId: currentTrolleyId,
      drawerId: drawerId,
      qrId: qrId,
    });

    return (
      <>
        {/* Indicador de conexión */}
        <div className="fixed top-0 left-0 right-0 z-50">
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border-b border-yellow-500/20 p-2"
            >
              <p className="text-xs text-yellow-500 text-center">
                ⚠️ Desconectado del servidor - Reconectando...
              </p>
            </motion.div>
          )}

          {/* Información del QR Data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-primary/5 border-b border-primary/10 p-4"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">QR Data Actual</p>
                <p className="font-semibold text-foreground">
                  Vuelo: {lastQRData.flight_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliente: {lastQRData.customer_name}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                  {isConnected ? "Conectado" : "Conectando..."}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* TrolleyManager como componente principal - key basado en qr_id para forzar remontaje */}
        <motion.div
          key={`${qrId}-${currentTrolleyId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <TrolleyManager trolleyId={currentTrolleyId} />
        </motion.div>

        {/* Debug Panel - Remover en producción */}
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg font-mono z-40 max-w-xs">
          <div className="space-y-1">
            <div>📱 QR ID: {qrId}</div>
            <div>🛒 Trolley ID: {currentTrolleyId}</div>
            <div>📦 Drawer ID: {drawerId}</div>
            <div>🛰️ WS: {isConnected ? '✅' : '❌'}</div>
            <div>✈️ {lastQRData.flight_number}</div>
            <div>👤 {lastQRData.customer_name}</div>
          </div>
        </div>
      </>
    )
  }

  // Si no hay datos de QR, mostrar pantalla de espera
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader className="w-6 h-6 text-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Esperando QR</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Escanea un código QR para comenzar a llenar un trolley
          </p>

          {/* Debug info */}
          <div className="mt-6 p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
            <div>Estado: {isLoading ? 'Cargando...' : 'Listo'}</div>
            <div>Conectado: {isConnected ? '✅' : '❌'}</div>
            <div>QR Data recibido: {lastQRData ? '✅ Sí' : '❌ No'}</div>
            {lastQRData && (
              <>
                <div className="border-t pt-2 mt-2 text-left">
                  <div className="font-bold mb-1">Datos del QR:</div>
                  <div>✈️ Vuelo: {lastQRData.flight_number}</div>
                  <div>👤 Cliente: {lastQRData.customer_name}</div>
                  <div>📮 Drawer ID: {lastQRData.drawer_id}</div>
                  <div className="mt-1 pt-1 border-t">
                    <div className="font-bold">🆔 Trolley IDs:</div>
                    {lastQRData.trolley_ids && lastQRData.trolley_ids.length > 0 ? (
                      <div className="text-green-600">✅ {lastQRData.trolley_ids.join(', ')}</div>
                    ) : (
                      <div className="text-red-600">❌ No encontrados (undefined o vacío)</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {wsError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-500">{wsError}</p>
            </div>
          )}
        </Card>
      </motion.div>
    </main>
  )
}
