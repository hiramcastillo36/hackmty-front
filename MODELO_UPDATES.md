# Actualizaciones del Modelo API - Cambios de Estructura

## Resumen de Cambios

Se han realizado cambios en los modelos de la API para reflejar mejor la estructura real del negocio. Los cambios principales son:

## 1. TrolleyItem - Cambios Estructurales

### Campos Removidos
- ❌ `available: boolean` - Ya no se usa en el modelo

### Campos Agregados
- ✅ `level: number` - Referencia al nivel del trolley (writeOnly)
- ✅ `price: string` - Precio del artículo (opcional)
- ✅ `created_at: string` - Timestamp de creación (readOnly)
- ✅ `updated_at: string` - Timestamp de actualización (readOnly)

### Estructura Actual

```typescript
interface TrolleyItem {
  id: number;                  // readOnly
  level: number;               // required, writeOnly
  name: string;                // required
  description?: string;
  sku: string;                 // required
  quantity: number;            // required, >= 0
  image?: string;              // uri format
  price?: string;              // decimal format
  category: string;            // required
  created_at: string;          // readOnly
  updated_at: string;          // readOnly
}
```

### Ejemplo de Uso - Crear Item

```typescript
const newItem: TrolleyItem = {
  level: 1,                    // Nivel 1 (Superior)
  name: "Coca-Cola",
  sku: "SKU-COCA-001",
  category: "Bebidas",
  quantity: 12,
  price: "2.50",
  description: "Bebida fría"
};

await itemService.createItem(newItem, imageFile);
```

## 2. TrolleyLevel - Cambios Estructurales

### Campos Removidos
- ❌ `name: string` - Los niveles ya no tienen nombre personalizado

### Campos Agregados
- ✅ `trolley: number` - Referencia al trolley (required)
- ✅ `level_number: 1 | 2 | 3` - Enum restringido a 3 niveles
- ✅ `level_display: string` - Nombre del nivel (readOnly, ej: "Nivel 1 (Superior)")
- ✅ `created_at: string` - Timestamp de creación (readOnly)
- ✅ `updated_at: string` - Timestamp de actualización (readOnly)

### Estructura Actual

```typescript
interface TrolleyLevel {
  id: number;                          // readOnly
  trolley: number;                     // required
  level_number: 1 | 2 | 3;            // required - enum
  level_display: string;               // readOnly (ej: "Nivel 1 (Superior)")
  capacity: number;                    // required
  description?: string;
  items: TrolleyItem[];                // readOnly
  created_at: string;                  // readOnly
  updated_at: string;                  // readOnly
}
```

### Validación de level_number

```
1 = Nivel 1 (Superior)
2 = Nivel 2 (Medio)
3 = Nivel 3 (Inferior)
```

### Ejemplo de Uso - Crear Level

```typescript
const newLevel: TrolleyLevel = {
  trolley: 1,
  level_number: 1,
  capacity: 20,
  description: "Nivel para bebidas"
};

await levelService.createLevel(newLevel);
```

## 3. QRData - Cambios Estructurales

### Campos Agregados
- ✅ `trolleys: TrolleyList[]` - Lista de trolleys asociados (readOnly)
- ✅ `trolley_ids: number[]` - IDs de trolleys a asociar (writeOnly)

### Estructura Actual

```typescript
interface QRData {
  id: number;                          // readOnly
  station_id: string;                  // required
  flight_number: string;               // required
  customer_name: string;               // required
  drawer_id: string;                   // required
  trolleys: TrolleyList[];             // readOnly - objects completos
  trolley_ids: number[];               // writeOnly - solo IDs
  created_at: string;                  // readOnly
  updated_at: string;                  // readOnly
}
```

### Ejemplo de Uso - Crear QR Data

```typescript
const qrData: QRData = {
  station_id: "PK02",
  flight_number: "QR117",
  customer_name: "Qatar Airways",
  drawer_id: "DRW_013",
  trolley_ids: [1, 2, 3]  // Solo se envía en escritura
};

await qrDataService.createQRData(qrData);
```

### Al Leer QRData

```typescript
// La respuesta incluye trolleys completos
{
  id: 1,
  station_id: "PK02",
  flight_number: "QR117",
  customer_name: "Qatar Airways",
  drawer_id: "DRW_013",
  trolleys: [
    {
      id: 1,
      name: "Trolley Bebidas",
      airline: "Qatar Airways",
      level_count: "3",
      created_at: "2024-10-26T..."
    },
    // ... más trolleys
  ],
  created_at: "2024-10-26T...",
  updated_at: "2024-10-26T..."
}
```

## 4. TrolleyList - Nueva Interfaz

Se ha introducido una nueva interfaz `TrolleyList` para las respuestas de listado simplificado.

### Estructura

```typescript
interface TrolleyList {
  id: number;                  // readOnly
  name: string;                // required
  airline: string;             // required
  level_count: string;         // readOnly (ej: "3")
  created_at: string;          // readOnly
}
```

### Uso

Esta interfaz se utiliza en:
- Respuestas de `GET /api/trolleys/`
- Dentro de `QRData.trolleys`
- Para listados optimizados sin incluir todos los detalles

## 5. Campos con Control de Lectura/Escritura

### readOnly (No se envían en POST/PUT)
```typescript
id              // Asignado por servidor
created_at      // Asignado por servidor
updated_at      // Asignado por servidor
level_display   // Calculado por servidor
level_count     // Calculado por servidor
trolleys        // En QRData - relación completa
items           // En Level - relación completa
```

### writeOnly (Solo se envían, no se reciben)
```typescript
trolley_ids     // En QRData - para asociar trolleys
level            // En Item - para vincular al nivel
```

## Migraciones de Código

### Crear Item - Antes vs Ahora

**Antes:**
```typescript
const item = {
  name: "Coca-Cola",
  sku: "SKU-COCA",
  category: "Bebidas",
  quantity: 12,
  available: true  // ❌ Ya no existe
};
```

**Ahora:**
```typescript
const item = {
  level: 1,              // ✅ Nuevo
  name: "Coca-Cola",
  sku: "SKU-COCA",
  category: "Bebidas",
  quantity: 12,
  price: "2.50"         // ✅ Opcional pero útil
};
```

### Crear Level - Antes vs Ahora

**Antes:**
```typescript
const level = {
  name: "Level 1",              // ❌ Ya no existe
  level_number: 1,
  capacity: 20
};
```

**Ahora:**
```typescript
const level = {
  level_number: 1,              // 1, 2, o 3
  capacity: 20,
  // level_display se recibe del servidor
};
```

## Impacto en Componentes

### Cambios en useItems Hook

El parámetro `available` sigue siendo válido como filtro:
```typescript
// Aún funciona - es un parámetro de query
fetchItems(1, undefined, "Bebidas", true);
```

Pero NO se puede asignar a items individuales.

### Cambios en TrolleyManager

Cuando se crea un item, ahora se requiere especificar `level`:
```typescript
const item = {
  level: 1,  // REQUERIDO
  name: "...",
  // ... otros campos
};
```

## API REST - Ejemplos de Requests

### POST /api/items/

```bash
curl -X POST http://localhost:8000/api/items/ \
  -H "Content-Type: application/json" \
  -d '{
    "level": 1,
    "name": "Agua Mineral",
    "sku": "SKU-AGUA-001",
    "category": "Bebidas",
    "quantity": 20,
    "price": "1.50",
    "description": "Agua purificada"
  }'
```

Respuesta:
```json
{
  "id": 123,
  "level": 1,
  "name": "Agua Mineral",
  "sku": "SKU-AGUA-001",
  "category": "Bebidas",
  "quantity": 20,
  "price": "1.50",
  "description": "Agua purificada",
  "image": null,
  "created_at": "2024-10-26T14:30:00Z",
  "updated_at": "2024-10-26T14:30:00Z"
}
```

### POST /api/levels/

```bash
curl -X POST http://localhost:8000/api/levels/ \
  -H "Content-Type: application/json" \
  -d '{
    "trolley": 1,
    "level_number": 1,
    "capacity": 20,
    "description": "Nivel para bebidas"
  }'
```

Respuesta:
```json
{
  "id": 456,
  "trolley": 1,
  "level_number": 1,
  "level_display": "Nivel 1 (Superior)",
  "capacity": 20,
  "description": "Nivel para bebidas",
  "items": [],
  "created_at": "2024-10-26T14:30:00Z",
  "updated_at": "2024-10-26T14:30:00Z"
}
```

### POST /api/qr-data/

```bash
curl -X POST http://localhost:8000/api/qr-data/ \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "PK02",
    "flight_number": "QR117",
    "customer_name": "Qatar Airways",
    "drawer_id": "DRW_013",
    "trolley_ids": [1, 2]
  }'
```

Respuesta:
```json
{
  "id": 789,
  "station_id": "PK02",
  "flight_number": "QR117",
  "customer_name": "Qatar Airways",
  "drawer_id": "DRW_013",
  "trolleys": [
    {
      "id": 1,
      "name": "Trolley Bebidas",
      "airline": "Qatar Airways",
      "level_count": "3",
      "created_at": "2024-10-26T..."
    }
  ],
  "created_at": "2024-10-26T14:30:00Z",
  "updated_at": "2024-10-26T14:30:00Z"
}
```

## Fecha de Actualización

- **Fecha**: 2024-10-26
- **Versión API**: 1.0.0
- **Status**: ✅ Implementado y compilado

## Notas Importantes

1. **Tres Niveles Fijos**: Los trolleys ahora tienen exactamente 3 niveles (Superior, Medio, Inferior)
2. **Items requieren Level**: Todo item debe estar asociado a un nivel específico
3. **Precios Opcionales**: El precio es un campo opcional pero recomendado
4. **Timestamps Automáticos**: `created_at` y `updated_at` se asignan automáticamente
5. **QR a Trolleys**: Un registro QR puede estar asociado a múltiples trolleys

## Compatibilidad

✅ Backend: API REST actualizada (versión que proporcionaste)
✅ Frontend: Tipos y servicios actualizados
✅ Build: Sin errores de compilación
✅ TypeScript: Full type safety mantenido
