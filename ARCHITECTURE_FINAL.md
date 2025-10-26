# Arquitectura Final - Endpoints Únicos

## Resumen Ejecutivo

Sistema simplificado que utiliza **ÚNICAMENTE** dos endpoints:

1. **WebSocket** - Recibe datos de escaneo QR en tiempo real
2. **REST API** - `/api/trolleys/{id}/required-contents/` - Obtiene contenidos del trolley

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    QR SCAN MONITOR                          │
│              (componente visual principal)                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────┐
          │     useQRScanFlow Hook           │
          │  (orquesta el flujo)             │
          └──────────────────────────────────┘
                  │              │
        ┌─────────┘              └──────────┐
        ▼                                    ▼
    WebSocket              TrolleyContentsService
  (qr_data_created)    (/api/trolleys/{id}/required-contents/)
        │                                    │
        │                                    │
   QRDataV1             TrolleyRequiredContents
  (flight, customer,        (productos, niveles,
   drawer_id,              especificaciones)
   trolley_ids)
        │                                    │
        └─────────────────┬──────────────────┘
                          ▼
                   Estado Local
                   (qrData, trolleyContents)
                          │
                          ▼
                   Renderizar UI
```

## Endpoints Utilizados

### 1. WebSocket (Tiempo Real)

**URL**: `ws://localhost:8000/ws/trolley/`

**Mensajes Recibidos**:
```typescript
{
  "type": "qr_data_created",
  "data": {
    "id": 1,
    "station_id": "STN001",
    "flight_number": "QR117",
    "customer_name": "Ahmad Hassan",
    "drawer_id": "DRW_013",
    "trolley_ids": [1],
    "trolleys": [...],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Función**:
- Entrega QR data en tiempo real
- Proporciona `trolley_ids` para consultas posteriores
- Mantiene conexión persistente

### 2. REST API (Trolley Contents)

**URL**: `GET /api/trolleys/{id}/required-contents/`

**Parámetros**:
- `{id}`: trolley_id (número)

**Respuesta**:
```json
{
  "trolley_id": 1,
  "trolley_name": "Trolley de Bebidas - Qatar Airways",
  "airline": "Qatar Airways",
  "total_specs": 1,
  "total_items": 5,
  "total_quantity": 135,
  "specifications": [
    {
      "spec_id": "SPEC_QR117_001",
      "spec_name": "Qatar Airways QR117 - Especificación Estándar",
      "spec_description": "Plan de carga para vuelo QR117",
      "total_items_count": 5,
      "total_quantity": 135,
      "by_level": [
        {
          "level_number": 1,
          "level_display": "Nivel 1 (Superior)",
          "products": [
            {
              "product_id": 2,
              "product_name": "Jugo de Naranja",
              "sku": "DRK025",
              "category": "Bebida",
              "required_quantity": 30,
              "price": 3.0,
              "image": "https://..."
            }
          ]
        }
      ],
      "by_drawer": [
        {
          "drawer_id": "DRW_013",
          "drawer_level": "Nivel 1 (Superior)",
          "products": [...]
        }
      ]
    }
  ]
}
```

**Función**:
- Obtiene especificaciones del trolley
- Productos organizados por nivel y drawer
- Información completa de cada producto

## Flujo de Datos

### Paso 1: Recibir QR del WebSocket

```
WebSocket Message
    ↓
Evento: qr_data_created
    ↓
QRDataV1 {
  trolley_ids: [1],
  drawer_id: "DRW_013",
  flight_number: "QR117",
  customer_name: "Ahmad Hassan"
}
```

### Paso 2: Procesar con useQRScanFlow

```
processQRData(qrData)
    ↓
Extrae: trolley_id = qrData.trolley_ids[0]
    ↓
Valida que exista trolley_id
    ↓
Estado: loading_contents
```

### Paso 3: Consultar Trolley Contents

```
GET /api/trolleys/1/required-contents/
    ↓
Response: TrolleyRequiredContents
    ↓
Estado: complete
    ↓
Renderizar productos
```

## Servicios Utilizados

### TrolleyContentsService

```typescript
class TrolleyContentsService {
  static async getTrolleyContents(
    trolleyId: number
  ): Promise<ApiClientResponse<TrolleyRequiredContents>>
}
```

**Ubicación**: `src/services/trolley-contents.service.ts`

## Hooks Utilizados

### useQRScanFlow

```typescript
const {
  qrData,              // QRDataV1 | null
  trolleyContents,     // TrolleyRequiredContents | null
  isLoading,           // boolean
  error,               // string | null
  stage,               // 'idle' | 'scanning' | 'loading_contents' | 'complete' | 'error'
  processQRData,       // async (qrData: QRDataV1) => Promise<void>
  reset,               // () => void
  clearError,          // () => void
} = useQRScanFlow();
```

**Ubicación**: `src/hooks/useQRScanFlow.ts`

## Componentes

### QRScanMonitor

```typescript
import { QRScanMonitor } from '@/components/qr-scan-monitor';

<QRScanMonitor />
```

**Ubicación**: `src/components/qr-scan-monitor.tsx`

**Funciones**:
- Botón para simular escaneo de QR
- Muestra estado en tiempo real
- Información del QR
- Productos del drawer
- Productos por nivel
- Manejo de errores

## Tipos

### QRDataV1
```typescript
interface QRDataV1 {
  id: number;
  station_id: string;
  flight_number: string;
  customer_name: string;
  drawer_id: string;
  trolley_ids: number[];        // ← Usado para consultar contents
  trolleys?: Array<{...}>;
  created_at: string;
  updated_at: string;
}
```

### TrolleyRequiredContents
```typescript
interface TrolleyRequiredContents {
  trolley_id: number;
  trolley_name: string;
  airline: string;
  total_specs: number;
  total_items: number;
  total_quantity: number;
  specifications: TrolleySpecification[];
}
```

## Servicios Removidos

Eliminados para simplificar:

- ❌ `DrawerService` - No necesario
- ❌ `SensorDataService` - No necesario
- ❌ `QRDataService` (v0) - Reemplazado por WebSocket
- ❌ `QRDataV1Service` - Reemplazado por WebSocket
- ❌ `TrolleyService` - No necesario (solo contents)
- ❌ `ItemService` - No necesario
- ❌ `LevelService` - No necesario
- ❌ Todos los hooks excepto `useQRScanFlow`

## Integración

### En app/page.tsx

```typescript
import { QRScanMonitor } from '@/components/qr-scan-monitor';

export default function Home() {
  return (
    <main>
      <div className="container mx-auto p-4 md:p-6">
        <QRScanMonitor />
      </div>
    </main>
  );
}
```

## Flujo Completo Visual

```
┌────────────────────────────────────────┐
│   Escanear QR (simulado o real)        │
└────────────────┬───────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │  WebSocket       │
         │  qr_data_created │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────────────────────┐
         │  useQRScanFlow.processQRData()   │
         │  - Extrae trolley_ids del QR     │
         │  - Valida datos                  │
         │  - Estado: loading_contents      │
         └────────┬─────────────────────────┘
                  │
                  ▼
    ┌────────────────────────────────────────┐
    │ GET /api/trolleys/{id}/required-contents/
    │    TrolleyContentsService.getTrolleyContents()
    └────────┬──────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Response: TrolleyRequiredContents     │
    │  - Productos por nivel                 │
    │  - Productos por drawer                │
    │  - Especificaciones                    │
    └────────┬──────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Estado: complete                      │
    │  Renderizar QRScanMonitor              │
    │  - QR info                             │
    │  - Productos drawer                    │
    │  - Productos nivel                     │
    └────────────────────────────────────────┘
```

## Performance

- **Endpoints**: 2 únicos (WebSocket + 1 REST)
- **Requests HTTP**: 1 por QR escaneado
- **Latencia**: Mínima (sin lookups intermedios)
- **Complejo idad**: Reducida
- **Mantenimiento**: Simplificado

## Build Status

```
✓ Compiled successfully in 1625.2ms
✓ TypeScript - No errors
✓ Production ready
✓ Routes generated (/, /monitor, /_not-found)
```

## Archivos Clave

- `src/hooks/useQRScanFlow.ts` - Lógica principal
- `src/components/qr-scan-monitor.tsx` - UI
- `src/services/trolley-contents.service.ts` - API call
- `src/types/api.ts` - Types

## Cómo Usar

### 1. Escáner Real (WebSocket)

Los datos fluyen automáticamente desde el WebSocket:

```typescript
// En la app, el WebSocket recibe:
{
  type: "qr_data_created",
  data: { flight: "QR117", trolley_ids: [1], ... }
}

// useQRScanFlow procesa automáticamente
// Se consulta /api/trolleys/1/required-contents/
// Se muestran los contenidos
```

### 2. Simulación (Botón)

Para testing, usa el botón "Simular Escaneo de QR":

```typescript
handleMockScan()
  → processQRData(mockQRData)
  → GET /api/trolleys/1/required-contents/
  → Mostrar contenidos
```

## Summary

Sistema ultra-simplificado con:

✅ **2 endpoints únicos**
✅ **1 hook principal**
✅ **1 componente visual**
✅ **Flujo claro y directo**
✅ **Bajo acoplamiento**
✅ **Fácil de mantener**
✅ **Production ready**

**Total**: ~300 líneas de código productivo
**Complejidad**: Mínima
**Escalabilidad**: Alta

---

**Fecha**: 2025-10-26
**Versión**: 3.0.0 (Ultra-simplificada)
**Status**: ✅ Production Ready
