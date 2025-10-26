"use client"

import TrolleyManager from "@/components/trolley-manager"
import { QRScanMonitor } from "@/components/qr-scan-monitor"
import { useTrolleyWebSocket } from "@/hooks/useTrolleyWebSocket"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const { isConnected, lastQRData, error: wsError, isLoading } = useTrolleyWebSocket()

  // Manejo de errores
  const hasError = wsError
  const errorMessage = wsError

  if (hasError) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 border-red-500/50 bg-red-500/5">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-500 mb-2">Error de Conexión</h2>
                <p className="text-sm text-red-500/80 mb-4">{errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded border border-red-500/20"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    )
  }

  // Pantalla de carga
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
            {lastQRData && (
              <p className="text-xs text-muted-foreground mt-1">
                {lastQRData.flight_number} - {lastQRData.customer_name}
              </p>
            )}
          </div>
        </motion.div>
      </main>
    )
  }

  // Si no hay QR data, mostrar pantalla con monitor de QR
  // La aplicación continúa funcionando aunque no haya conexión WebSocket

  return (
    <main className="min-h-screen bg-background">
      {/* Estado de conexión */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 p-2 z-40"
        >
          <p className="text-xs text-yellow-500 text-center">
            ⚠️ Desconectado del servidor - Reconectando...
          </p>
        </motion.div>
      )}

      {/* QR Scan Monitor - Main Feature */}
      <div className="container mx-auto p-4 md:p-6">
        <QRScanMonitor />
      </div>

      {/* Información del QR Data Actual */}
      {lastQRData && (
        <div className="sticky top-0 z-30 bg-primary/5 border-b border-primary/10 p-4">
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
        </div>
      )}

      {/* Trolley Manager - Solo si hay trolley ID disponible */}
      {lastQRData?.trolley_ids?.[0] ? (
        <TrolleyManager trolleyId={lastQRData.trolley_ids[0]} />
      ) : (
        <div className="container mx-auto p-4 md:p-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Esperando datos de QR o puedes usar el botón "Simular Escaneo" arriba para probar
            </p>
          </Card>
        </div>
      )}
    </main>
  )
}
