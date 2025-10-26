'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { QRData } from '@/types/qr-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Activity, AlertCircle, CheckCircle2, Loader, Send, Wifi, WifiOff } from 'lucide-react';

interface QRMonitorProps {
  wsUrl?: string;
  apiUrl?: string;
}

export function QRMonitor({ wsUrl = 'ws://172.191.94.124:8000/ws/qr-data/', apiUrl = 'http://172.191.94.124:8000' }: QRMonitorProps) {
  const { isConnected, qrDataList, totalCount, lastUpdate, connect, disconnect, error } = useWebSocket(wsUrl);

  const [stationId, setStationId] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [drawerId, setDrawerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    connect();
  }, [connect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/qr-data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          station_id: stationId,
          flight_number: flightNumber,
          customer_name: customerName,
          drawer_id: drawerId,
        }),
      });

      if (response.ok) {
        toast.success(`✅ QRData creado: ${flightNumber}`);
        setStationId('');
        setFlightNumber('');
        setCustomerName('');
        setDrawerId('');
      } else {
        const error = await response.json();
        toast.error(`❌ Error: ${JSON.stringify(error)}`);
      }
    } catch (err) {
      toast.error('❌ Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastTime = lastUpdate ? lastUpdate.toLocaleTimeString('es-MX') : '-';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Activity className="text-purple-400" size={40} />
              QRData Monitor en Tiempo Real
            </h1>
          </div>
          <p className="text-gray-300">Monitorea los datos QR conforme se registran</p>
        </div>

        {/* Status Bar */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-75"></div>
                        <div className="relative w-4 h-4 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-green-400 font-semibold">Conectado ✅</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 font-semibold">Desconectado ❌</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={connect}
                  disabled={isConnected}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Wifi size={16} />
                  Conectar
                </Button>
                <Button
                  onClick={disconnect}
                  disabled={!isConnected}
                  variant="destructive"
                  className="gap-2"
                >
                  <WifiOff size={16} />
                  Desconectar
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-gap gap-3">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Data List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <CheckCircle2 size={24} className="text-blue-400" />
                  Datos QR Recibidos
                </h2>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="text-gray-400 text-sm mb-2">Total Registros</div>
                    <div className="text-3xl font-bold text-purple-400">{totalCount}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="text-gray-400 text-sm mb-2">Último Registro</div>
                    <div className="text-sm font-mono text-gray-300">{lastTime}</div>
                  </div>
                </div>

                {/* QR List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {qrDataList.length === 0 ? (
                    <div className="text-center py-12">
                      <Loader size={48} className="text-gray-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-400">Sin datos aún. Esperando QR...</p>
                    </div>
                  ) : (
                    qrDataList.map((qr, index) => (
                      <QRDataItem key={`${qr.id}-${index}`} qrData={qr} isNew={index === 0} />
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Form Panel */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">📝 Crear QRData</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Station ID *</label>
                    <input
                      type="text"
                      value={stationId}
                      onChange={(e) => setStationId(e.target.value)}
                      placeholder="ej: PK02"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Flight Number *</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="ej: QR117"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ej: Qatar Airways"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Drawer ID *</label>
                    <input
                      type="text"
                      value={drawerId}
                      onChange={(e) => setDrawerId(e.target.value)}
                      placeholder="ej: DRW_013"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 gap-2 mt-6"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Creando...' : 'Crear QRData'}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function QRDataItem({ qrData, isNew }: { qrData: QRData; isNew: boolean }) {
  const createdTime = new Date(qrData.created_at).toLocaleString('es-MX');

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 ${
        isNew
          ? 'bg-blue-900/40 border-blue-500/50 shadow-lg shadow-blue-500/10 scale-105'
          : 'bg-slate-700/40 border-slate-600/50 hover:bg-slate-700/60'
      }`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-gray-400 text-xs">Station</span>
            <div className="font-semibold text-white">{qrData.station_id}</div>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Flight</span>
            <div className="font-semibold text-purple-300">{qrData.flight_number}</div>
          </div>
        </div>

        <div>
          <span className="text-gray-400 text-xs">Customer</span>
          <div className="text-white">{qrData.customer_name}</div>
        </div>

        <div>
          <span className="text-gray-400 text-xs">Drawer</span>
          <div className="text-white font-mono text-sm">{qrData.drawer_id}</div>
        </div>

        <div className="pt-2 border-t border-slate-600/30">
          <span className="text-gray-500 text-xs">⏰ {createdTime}</span>
        </div>
      </div>
    </div>
  );
}
