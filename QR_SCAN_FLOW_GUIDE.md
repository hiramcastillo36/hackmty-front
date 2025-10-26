# QR Scan Flow Integration Guide

## Overview

Sistema completo de escaneo de QR que integra:
1. **QR Data** → Obtiene `drawer_id`
2. **Drawer Lookup** → Obtiene `trolley_id`
3. **Trolley Contents** → Obtiene productos esperados

## Arquitectura

```
QR Scan
  ↓
useQRScanFlow Hook (orquesta el flujo)
  ├─→ DrawerService.getDrawerById(drawer_id)
  │   └─→ Obtiene: trolley_id, drawer_level, etc.
  │
  ├─→ TrolleyContentsService.getTrolleyContents(trolley_id)
  │   └─→ Obtiene: productos, especificaciones, etc.
  │
  └─→ QRScanMonitor Component (muestra resultados)
      ├─→ Productos del drawer específico
      ├─→ Productos por nivel
      └─→ Información del trolley
```

## Componentes Creados

### 1. useQRScanFlow Hook
**Archivo**: `src/hooks/useQRScanFlow.ts`

Hook que orquesta el flujo completo:

```typescript
const {
  qrData,              // QR data escaneado
  drawer,              // Información del drawer obtenida
  trolleyContents,     // Contenidos del trolley
  isLoading,           // Estado de carga
  error,               // Mensajes de error
  stage,               // 'idle' | 'scanning' | 'loading_drawer' | 'loading_contents' | 'complete' | 'error'
  scanQR,              // async function(qrData: QRDataV1)
  reset,               // Limpiar estado
  clearError,          // Limpiar error
  getDrawerProducts,   // Obtener productos del drawer
} = useQRScanFlow();
```

### 2. QRScanMonitor Component
**Archivo**: `src/components/qr-scan-monitor.tsx`

Componente visual completo que:
- Permite escanear un QR (mock para demostración)
- Muestra el estado en tiempo real
- Muestra información del QR
- Muestra información del drawer
- Muestra productos del trolley por drawer
- Muestra productos por nivel

### 3. DrawerData Type
**Archivo**: `src/services/drawer.service.ts`

```typescript
interface DrawerData {
  id: number;
  trolley: number;           // ← El trolley_id que necesitamos
  trolley_name: string;
  drawer_id: string;         // ← Viene del QR
  level: number;
  level_display: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

## Flujo de Datos

### Paso 1: Escanear QR
```typescript
QRDataV1 {
  id: 1,
  station_id: "STN001",
  flight_number: "QR117",
  customer_name: "Ahmad Hassan",
  drawer_id: "DRW_013",  // ← IMPORTANTE: Este es el identificador que necesitamos
  trolley_ids: [1],
  trolleys: [...],
  created_at: "...",
  updated_at: "..."
}
```

### Paso 2: Consultar Drawer
```
GET /api/v1/drawers/by-id/DRW_013/

Response:
{
  id: 1,
  trolley: 1,            // ← Obtenemos el trolley_id aquí
  trolley_name: "Trolley de Bebidas - Qatar Airways",
  drawer_id: "DRW_013",
  level: 1,
  level_display: "Nivel 1 (Superior)",
  description: null,
  created_at: "...",
  updated_at: "..."
}
```

### Paso 3: Consultar Contenidos del Trolley
```
GET /api/trolleys/1/required-contents/

Response:
{
  trolley_id: 1,
  trolley_name: "Trolley de Bebidas - Qatar Airways",
  airline: "Qatar Airways",
  total_specs: 1,
  total_items: 5,
  total_quantity: 135,
  specifications: [
    {
      spec_id: "SPEC_QR117_001",
      by_level: [...],
      by_drawer: [
        {
          drawer_id: "DRW_013",
          drawer_level: "Nivel 1 (Superior)",
          products: [
            {
              product_id: 2,
              product_name: "Jugo de Naranja",
              sku: "DRK025",
              category: "Bebida",
              required_quantity: 30,
              price: 3.0,
              image: "https://..."
            },
            ...
          ]
        },
        ...
      ]
    }
  ]
}
```

## Uso en Componentes

### Usar el Hook
```typescript
import { useQRScanFlow } from '@/hooks/useQRScanFlow';
import { QRDataV1 } from '@/types/api';

function MyComponent() {
  const { qrData, trolleyContents, scanQR, isLoading, error } = useQRScanFlow();

  const handleScan = async (qrData: QRDataV1) => {
    await scanQR(qrData);
  };

  return (
    <div>
      <button onClick={() => handleScan(mockQRData)}>
        Escanear QR
      </button>

      {isLoading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {trolleyContents && (
        <div>
          <h2>{trolleyContents.trolley_name}</h2>
          <p>Total: {trolleyContents.total_quantity} unidades</p>
        </div>
      )}
    </div>
  );
}
```

### Usar el Componente QRScanMonitor
```typescript
import { QRScanMonitor } from '@/components/qr-scan-monitor';

export function Page() {
  return (
    <main>
      <QRScanMonitor />
    </main>
  );
}
```

## Stages del Flujo

| Stage | Descripción |
|-------|------------|
| `idle` | Listo para escanear, sin datos |
| `scanning` | QR ha sido escaneado |
| `loading_drawer` | Consultando información del drawer |
| `loading_contents` | Consultando contenidos del trolley |
| `complete` | Proceso completado exitosamente |
| `error` | Ocurrió un error en el proceso |

## Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|------------|
| `/api/v1/drawers/by-id/{drawer_id}/` | GET | Obtener información del drawer |
| `/api/trolleys/{id}/required-contents/` | GET | Obtener contenidos requeridos |

## Helper Methods

### getDrawerProducts()
```typescript
const drawerProducts = getDrawerProducts();

// Retorna array de productos asignados al drawer actual
// Ej: [
//   {
//     product_id: 2,
//     product_name: "Jugo de Naranja",
//     sku: "DRK025",
//     category: "Bebida",
//     required_quantity: 30,
//     price: 3.0,
//     image: "..."
//   },
//   ...
// ]
```

## Troubleshooting

### Error: "No drawer_id in QR data"
**Causa**: El QR escaneado no tiene el campo `drawer_id`
**Solución**: Verifica que el QR tenga el formato correcto con `drawer_id`

### Error: "Drawer not found"
**Causa**: El endpoint `/api/v1/drawers/by-id/{drawer_id}/` no está encontrando el drawer
**Solución**:
- Verifica que el drawer existe en la base de datos
- Revisa que el endpoint está correctamente configurado
- Verifica en la consola del navegador el valor de `drawer_id`

### Error: "No trolley_id found in drawer response"
**Causa**: El drawer no tiene el campo `trolley` (trolley_id)
**Solución**:
- Verifica la estructura de la respuesta del drawer
- Asegúrate que el drawer está correctamente vinculado a un trolley

### Error: "Failed to get trolley contents"
**Causa**: El endpoint `/api/trolleys/{id}/required-contents/` no funciona
**Solución**:
- Verifica que el trolley existe
- Revisa que el `trolley_id` es correcto
- Comprueba que el endpoint está correctamente configurado

## Debugging

Para ver mensajes detallados en la consola:

```typescript
// El hook registra automáticamente:
console.log('📱 QR Escaneado:', {...})
console.log('🔍 Consultando drawer:', drawer_id)
console.log('✅ Drawer encontrado:', {...})
console.log('📦 Consultando contenidos del trolley:', trolley_id)
console.log('✅ Contenidos obtenidos:', {...})
```

## Integración en app/page.tsx

El componente `QRScanMonitor` está integrado en la página principal:

```typescript
import { QRScanMonitor } from '@/components/qr-scan-monitor';

export default function Home() {
  return (
    <main>
      <div className="container mx-auto p-4 md:p-6">
        <QRScanMonitor />
      </div>
      {/* Rest of content */}
    </main>
  );
}
```

## Próximos Pasos

### Integración Real con Escáner QR
Actualmente el componente tiene un botón "Simular Escaneo de QR". Para integrar con un escáner real:

```typescript
useEffect(() => {
  const handleQRScan = (event: CustomEvent) => {
    const qrData = event.detail as QRDataV1;
    scanQR(qrData);
  };

  window.addEventListener('qr-scan', handleQRScan as EventListener);
  return () => window.removeEventListener('qr-scan', handleQRScan as EventListener);
}, [scanQR]);
```

### Agregar Verificación de Productos
Se puede agregar lógica para verificar que los productos escaneados coincidan con los esperados:

```typescript
const verifyProducts = (scannedProducts) => {
  const expectedProducts = getDrawerProducts();
  // Compare y reportar discrepancias
};
```

## Summary

Sistema completo funcional que:
- ✅ Escanea QR y obtiene `drawer_id`
- ✅ Consulta el drawer para obtener `trolley_id`
- ✅ Obtiene los contenidos esperados del trolley
- ✅ Muestra productos específicos del drawer
- ✅ Muestra productos organizados por nivel
- ✅ Manejo completo de errores
- ✅ UI profesional y responsive
- ✅ Estados de carga claros

Listo para producción con pequeños ajustes de configuración.
