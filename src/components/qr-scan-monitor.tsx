'use client';

import { useEffect, useState } from 'react';
import { useTrolleyContents } from '@/hooks/useTrolleyContents';
import { useTrolleyWebSocket } from '@/hooks/useTrolleyWebSocket';
import { QRDataV1 } from '@/types/api';

export function QRScanMonitor() {
  const [qrData, setQrData] = useState<QRDataV1 | null>(null);

  const { isConnected: wsConnected, onQRDataReceived } = useTrolleyWebSocket();
  const { contents: trolleyContents, isLoading, error, getTrolleyContents, clearError } = useTrolleyContents();

  // Integrar WebSocket con el flujo de escaneo
  useEffect(() => {
    // Registrar callback para cuando se reciba QR data del WebSocket
    onQRDataReceived?.((receivedQRData: QRDataV1) => {
      console.log('🔗 Integrando WebSocket con QR Scan Monitor');
      processQRData(receivedQRData);
    });
  }, [onQRDataReceived]);

  const processQRData = async (qrDataToProcess: QRDataV1) => {
    try {
      console.log('📱 Procesando QR data:', qrDataToProcess);
      setQrData(qrDataToProcess);

      // Cargar contenidos del trolley si hay trolley_ids
      if (qrDataToProcess.trolley_ids && qrDataToProcess.trolley_ids[0]) {
        await getTrolleyContents(qrDataToProcess.trolley_ids[0]);
      }
    } catch (err) {
      console.error('Error procesando QR data:', err);
    }
  };

  const reset = () => {
    setQrData(null);
    clearError();
  };

  // Simular escaneo de QR para demostración
  const handleMockScan = async () => {
    const mockQRData: QRDataV1 = {
      id: 1,
      station_id: 'STN001',
      flight_number: 'QR117',
      customer_name: 'Ahmad Hassan',
      drawer_id: 'DRW_013',
      trolley_ids: [1],
      trolleys: [
        {
          id: 1,
          name: 'Trolley de Bebidas - Qatar Airways',
          airline: 'Qatar Airways',
          level_count: '3',
          created_at: '2025-10-26T12:00:00Z',
        },
      ],
      created_at: '2025-10-26T12:30:00Z',
      updated_at: '2025-10-26T12:30:00Z',
    };

    await processQRData(mockQRData);
  };


  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Verificación de Carga de Trolley</h2>
            <p className="text-gray-600">Sistema integrado con WebSocket y endpoint /api/trolleys/required-contents/</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
              wsConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-600' : 'bg-yellow-600'} animate-pulse`} />
              {wsConnected ? '🔌 WebSocket Conectado' : '⏳ Conectando...'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estado actual</p>
            <p className="text-lg font-semibold text-gray-800">
              {isLoading ? '📦 Cargando contenidos...' : qrData ? '✅ Datos cargados' : '⏳ Listo para escanear'}
            </p>
          </div>
          {isLoading && (
            <div className="animate-spin">
              <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Scan Button */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={handleMockScan}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          title={wsConnected ? "O espera a que se reciba un QR del WebSocket" : "WebSocket no conectado"}
        >
          📱 Simular Escaneo de QR
        </button>
        {(qrData || trolleyContents) && (
          <button
            onClick={reset}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Limpiar
          </button>
        )}
      </div>

      {/* WebSocket Status Message */}
      {wsConnected && !qrData && !error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          ✅ WebSocket conectado. Los QR escaneados se procesarán automáticamente en tiempo real.
          <br />
          O utiliza el botón de arriba para simular un escaneo.
        </div>
      )}

      {/* QR Data Display */}
      {qrData && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-blue-200">
          <h3 className="font-bold text-gray-800 mb-3">📱 Datos del QR</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Vuelo:</span>
              <p className="font-semibold text-gray-800">{qrData.flight_number}</p>
            </div>
            <div>
              <span className="text-gray-500">Cliente:</span>
              <p className="font-semibold text-gray-800">{qrData.customer_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Drawer ID:</span>
              <p className="font-semibold text-gray-800">{qrData.drawer_id}</p>
            </div>
            <div>
              <span className="text-gray-500">Estación:</span>
              <p className="font-semibold text-gray-800">{qrData.station_id}</p>
            </div>
          </div>
        </div>
      )}


      {/* Trolley Contents Display */}
      {trolleyContents && (
        <div className="p-4 bg-white rounded-lg border border-purple-200">
          <h3 className="font-bold text-gray-800 mb-4">📦 Contenidos del Trolley</h3>

          {/* Trolley Summary */}
          <div className="mb-6 p-3 bg-purple-50 rounded border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-2">{trolleyContents.trolley_name}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Aerolínea:</span>
                <p className="font-semibold">{trolleyContents.airline}</p>
              </div>
              <div>
                <span className="text-gray-500">Total de Ítems:</span>
                <p className="font-semibold">{trolleyContents.total_items}</p>
              </div>
              <div>
                <span className="text-gray-500">Cantidad Total:</span>
                <p className="font-semibold">{trolleyContents.total_quantity}</p>
              </div>
            </div>
          </div>

          {/* Products by Drawer (for scanned drawer) */}
          {qrData && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">
                📍 Productos para Drawer {qrData.drawer_id}
              </h4>
              {(() => {
                const drawerProducts: any[] = [];
                trolleyContents?.specifications.forEach((spec) => {
                  const drawerSection = spec.by_drawer.find((d) => d.drawer_id === qrData.drawer_id);
                  if (drawerSection) {
                    drawerProducts.push(...drawerSection.products);
                  }
                });

                return drawerProducts.length > 0 ? (
                  <div className="space-y-3">
                    {drawerProducts.map((product) => (
                      <div key={product.product_id} className="flex items-start gap-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <img
                          src={product.image}
                          alt={product.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{product.product_name}</p>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <div className="mt-2 flex gap-4 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                              Cantidad: {product.required_quantity}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No hay productos asignados a este drawer</p>
                );
              })()}
            </div>
          )}

          {/* Products by Level */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">📊 Productos por Nivel</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((level) => {
                const levelProducts = trolleyContents.specifications.flatMap((spec) => {
                  const levelData = spec.by_level.find((l) => l.level_number === level);
                  return levelData ? levelData.products : [];
                });

                if (levelProducts.length === 0) return null;

                return (
                  <div key={level} className="p-3 bg-indigo-50 rounded border border-indigo-200">
                    <h5 className="font-semibold text-indigo-900 mb-2">
                      Nivel {level} ({levelProducts.length} ítems)
                    </h5>
                    <ul className="space-y-2 text-sm">
                      {levelProducts.map((product) => (
                        <li key={product.product_id} className="text-gray-700">
                          <span className="font-medium">{product.product_name}</span>
                          <br />
                          <span className="text-gray-600">
                            {product.required_quantity}x @ ${product.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!qrData && !trolleyContents && !isLoading && !error && (
        <div className="p-8 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No hay datos. Haz clic en el botón para escanear un QR.</p>
          <p className="text-sm text-gray-500">
            El sistema obtendrá automáticamente los contenidos del trolley desde el QR escaneado.
          </p>
        </div>
      )}
    </div>
  );
}
