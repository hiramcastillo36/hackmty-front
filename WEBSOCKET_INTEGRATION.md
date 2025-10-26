# WebSocket Integration - Trolley Manager

## Overview

El sistema ahora incluye integración con WebSocket para recibir información del trolley en tiempo real desde el servidor. Esto permite que la página inicial se conecte automáticamente al servidor y sepa qué trolley debe gestionar.

## Arquitectura

### Hook: `useTrolleyWebSocket`

Ubicación: [`src/hooks/useTrolleyWebSocket.ts`](src/hooks/useTrolleyWebSocket.ts)

Este hook maneja la conexión WebSocket con el servidor y proporciona información del trolley actual.

#### Interfaz

```typescript
interface TrolleyWebSocketData {
  trolley_id: number;
  trolley_name: string;
  airline: string;
  flight_number: string;
  status: string;
  timestamp: string;
}

interface UseTrolleyWebSocketReturn {
  isConnected: boolean;
  currentTrolley: TrolleyWebSocketData | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}
```

#### Uso

```typescript
import { useTrolleyWebSocket } from '@/hooks/useTrolleyWebSocket';

export function MyComponent() {
  const {
    isConnected,
    currentTrolley,
    error,
    isLoading,
  } = useTrolleyWebSocket('ws://localhost:8000/ws/trolley/');

  return (
    <div>
      {isLoading && <p>Conectando...</p>}
      {error && <p>Error: {error}</p>}
      {isConnected && <p>✅ Conectado</p>}
      {currentTrolley && (
        <div>
          <h2>{currentTrolley.trolley_name}</h2>
          <p>Vuelo: {currentTrolley.flight_number}</p>
        </div>
      )}
    </div>
  );
}
```

### Página Principal

Ubicación: [`src/app/page.tsx`](src/app/page.tsx)

La página principal ahora:

1. **Se conecta al WebSocket** para obtener el trolley actual
2. **Carga los datos del trolley** desde la API REST
3. **Pasa el ID del trolley** al componente TrolleyManager
4. **Muestra estados de carga y error**
5. **Muestra información del trolley** en un banner en la parte superior

#### Flujo de Conexión

```
1. Página se carga
   ↓
2. Hook useTrolleyWebSocket se conecta automáticamente
   ↓
3. Servidor envía información del trolley vía WebSocket
   ↓
4. Hook recibe el trolley_id
   ↓
5. Se llama a fetchTrolley(trolley_id) para obtener detalles
   ↓
6. TrolleyManager se renderiza con trolleyId
   ↓
7. TrolleyManager carga automáticamente los items del trolley
```

#### Estados Visuales

```
Cargando:
  - Spinner animado
  - "Conectando al servidor..." o "Cargando trolley..."
  - Información del trolley cuando está disponible

Conectado:
  - Banner verde indicando "Conectado"
  - Información del trolley en la parte superior
  - TrolleyManager funcionando normalmente

Desconectado:
  - Banner amarillo indicando "Desconectado - Reconectando..."
  - El sistema intenta reconectar automáticamente

Error:
  - Card roja mostrando el error
  - Botón para reintentar
```

## Configuración

### Variables de Entorno

```bash
# En .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/trolley/
```

O usa el default en el hook:

```typescript
useTrolleyWebSocket('ws://localhost:8000/ws/trolley/');
```

## Comportamiento de Reconexión

El hook implementa reintentos automáticos:

- **Máximo de intentos**: 5
- **Delay entre intentos**: 3000ms (3 segundos)
- **Backoff**: Linear (no exponencial)

```typescript
// En useTrolleyWebSocket.ts
const maxReconnectAttemptsRef = useRef(5);
const reconnectDelayRef = useRef(3000);
```

Si falla después de 5 intentos, muestra un mensaje de error con opción de reintentar manualmente.

## Mensajes WebSocket

### Servidor → Cliente

#### Tipo: `trolley_data`
Se envía cuando se conecta por primera vez o cuando se solicita:

```json
{
  "type": "trolley_data",
  "data": {
    "trolley_id": 1,
    "trolley_name": "Beverage Trolley",
    "airline": "Aeromexico",
    "flight_number": "AM2305",
    "status": "active",
    "timestamp": "2024-10-26T14:30:00Z"
  }
}
```

#### Tipo: `trolley_updated`
Se envía cuando la información del trolley cambia en tiempo real:

```json
{
  "type": "trolley_updated",
  "data": {
    "trolley_id": 1,
    "trolley_name": "Beverage Trolley",
    "airline": "Aeromexico",
    "flight_number": "AM2305",
    "status": "in_use",
    "timestamp": "2024-10-26T14:35:00Z"
  }
}
```

#### Tipo: `error`
Se envía cuando hay un error en el servidor:

```json
{
  "type": "error",
  "message": "No trolley assigned"
}
```

### Cliente → Servidor

#### Acción: `get_current_trolley`
Se envía cuando se conecta:

```json
{
  "action": "get_current_trolley"
}
```

## Integración con TrolleyManager

El componente TrolleyManager ha sido actualizado para aceptar un prop `trolleyId`:

```typescript
interface TrolleyManagerProps {
  trolleyId?: number;
}

export default function TrolleyManager({ trolleyId }: TrolleyManagerProps) {
  // ...
  const [useAPI, setUseAPI] = useState(!!trolleyId);

  useEffect(() => {
    if (trolleyId) {
      console.log("🛒 Cargando items para trolley:", trolleyId);
      fetchItems();
    }
  }, [trolleyId, fetchItems]);
  // ...
}
```

Cuando se proporciona `trolleyId`:

1. **API se activa automáticamente** (`useAPI = true`)
2. **Se cargan los items** del trolley desde la API
3. **El usuario puede comenzar a trabajar** inmediatamente

## Flujo Completo de Ejemplo

```
┌─────────────────────────────────────────────────────┐
│ Usuario abre la aplicación (/)                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │ Cargando...      │
         │ (Spinner)        │
         └────────┬─────────┘
                  │
                  ▼
    ┌────────────────────────────────┐
    │ useTrolleyWebSocket            │
    │ - Conecta a ws://...           │
    │ - Espera trolley_data          │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Servidor WebSocket             │
    │ - Recibe get_current_trolley   │
    │ - Envía trolley_data           │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Hook recibe trolley_id         │
    │ setCurrentTrolley(data)        │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ useEffect en page.tsx           │
    │ - Llama fetchTrolley(id)       │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ TrolleyService.getTrolley()    │
    │ - GET /api/trolleys/{id}/      │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ page.tsx renderiza             │
    │ - Banner con info trolley      │
    │ - TrolleyManager con trolleyId │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ TrolleyManager                 │
    │ - useEffect con trolleyId      │
    │ - Llama fetchItems()           │
    │ - Carga items de la API        │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ ItemService.listItems()        │
    │ - GET /api/items/              │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ TrolleyManager renderiza       │
    │ ✅ Listo para usar             │
    │ - Items del trolley cargados   │
    │ - Usuario puede comenzar       │
    └────────────────────────────────┘
```

## Manejo de Errores

### Error de Conexión WebSocket

```typescript
if (wsError) {
  return (
    <div style={{color: 'red'}}>
      Error: {wsError}
      <button onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );
}
```

### Error al Cargar Trolley API

```typescript
if (trolleyError) {
  return (
    <div style={{color: 'red'}}>
      Error al cargar trolley: {trolleyError}
      <button onClick={() => fetchTrolley(currentTrolley.trolley_id)}>Reintentar</button>
    </div>
  );
}
```

### Sin Trolley Asignado

```typescript
if (!currentTrolley) {
  return (
    <div style={{color: 'orange'}}>
      No hay trolley asignado.
      Verifica que el servidor esté enviando la información correcta.
    </div>
  );
}
```

## Testing WebSocket Localmente

### 1. Instalar cliente WebSocket (opcional)

```bash
# Con wscat
npm install -g wscat

# Conectarse al servidor
wscat -c ws://localhost:8000/ws/trolley/
```

### 2. Enviar mensaje de prueba

```json
{
  "type": "trolley_data",
  "data": {
    "trolley_id": 1,
    "trolley_name": "Test Trolley",
    "airline": "Test Airline",
    "flight_number": "TEST01",
    "status": "active",
    "timestamp": "2024-10-26T14:30:00Z"
  }
}
```

### 3. Verificar en consola del navegador

```javascript
// En la consola:
// Verás logs como:
// 🔌 Conectando al WebSocket de Trolley: ws://localhost:8000/ws/trolley/
// ✅ WebSocket de Trolley conectado
// 📨 Mensaje Trolley recibido: { type: 'trolley_data', data: {...} }
// 🛒 Trolley actual: Test Trolley
```

## Debugging

### Logs Disponibles

El hook imprime logs útiles para debugging:

```javascript
// Conexión
🔌 Conectando al WebSocket...
✅ WebSocket conectado
🔌 WebSocket desconectado

// Mensajes
📨 Mensaje recibido: {...}
🛒 Trolley actual: Beverage Trolley
🔄 Trolley actualizado: Updated Trolley

// Reconexión
🔄 Intentando reconectar... (1/5)
```

### Pasos para Debuggear

1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca logs que comienzan con 🔌, 📨, 🛒, etc.
4. Si no hay logs, verifica que:
   - La URL WebSocket es correcta
   - El servidor está corriendo
   - El servidor tiene soporte para WebSocket
   - No hay errores de CORS

## Próximas Mejoras Opcionales

1. **Polling Alternativo**: Si WebSocket no funciona, usar polling HTTP
2. **Persistencia**: Guardar el trolley actual en localStorage
3. **Notificaciones**: Alertar cuando el trolley cambia
4. **Estadísticas**: Mostrar conexión/desconexión en tiempo real
5. **Heartbeat**: Enviar ping periódicamente para detectar desconexiones

## Troubleshooting

### "WebSocket conexión rechazada"

**Solución**: Verifica que:
- El servidor está corriendo en `localhost:8000`
- La ruta WebSocket existe en `/ws/trolley/`
- No hay firewall bloqueando

### "Desconectado - Reconectando..."

**Normal**: El hook intenta reconectar automáticamente cada 3 segundos hasta 5 veces.

### "Sin trolley asignado"

**Problema**: El servidor no está enviando la información del trolley.

**Solución**: Verifica que el servidor envíe el mensaje `trolley_data` al conectarse.

### "Error de CORS en WebSocket"

**Nota**: WebSocket no usa CORS, pero asegúrate de que:
- El servidor permite conexiones WebSocket
- El protocolo es `ws://` o `wss://` (no `http://`)
