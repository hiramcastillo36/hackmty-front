# React Hooks Reference Guide

## Overview

All hooks are located in `src/hooks/` and provide comprehensive state management for API interactions and real-time data.

**Total Hooks**: 9

**New in This Session**: useTrolleyContents (inventory verification)

## 1. useTrolleyWebSocket
**Purpose**: Real-time WebSocket connection for trolley data and QR scanning

**Location**: `src/hooks/useTrolleyWebSocket.ts`

### Returns
```typescript
{
  isConnected: boolean;              // Connection status
  currentTrolley: TrolleyWebSocketData | null;
  error: string | null;
  connect: () => void;               // Manually connect
  disconnect: () => void;            // Manually disconnect
  isLoading: boolean;
}
```

### Usage
```typescript
import { useTrolleyWebSocket } from '@/hooks/useTrolleyWebSocket';

export function MyComponent() {
  const { currentTrolley, isConnected, error, isLoading } = useTrolleyWebSocket();

  if (isLoading) return <div>Connecting...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      {currentTrolley && (
        <div>
          <h2>{currentTrolley.trolley_name}</h2>
          <p>Flight: {currentTrolley.flight_number}</p>
        </div>
      )}
    </div>
  );
}
```

### Features
- ✅ Automatic WebSocket connection on mount
- ✅ Handles `qr_data_created` messages
- ✅ Drawer lookup and trolley resolution
- ✅ Automatic reconnection (5 attempts)
- ✅ Full error handling

---

## 2. useTrolleys
**Purpose**: CRUD operations for trolleys

**Location**: `src/hooks/useTrolleys.ts`

### Returns
```typescript
{
  trolley: TrolleyDetail | null;
  trolleys: TrolleyList[];
  isLoading: boolean;
  error: string | null;
  getTrolley: (id: number) => Promise<void>;
  listTrolleys: (page?: number, search?: string) => Promise<void>;
  createTrolley: (data: any) => Promise<void>;
  updateTrolley: (id: number, data: any) => Promise<void>;
  deleteTrolley: (id: number) => Promise<void>;
  clearError: () => void;
}
```

### Usage
```typescript
import { useTrolleys } from '@/hooks/useTrolleys';

export function TrolleyList() {
  const { trolleys, getTrolley, listTrolleys, isLoading } = useTrolleys();

  useEffect(() => {
    listTrolleys(1);
  }, []);

  return (
    <div>
      {isLoading ? <div>Loading...</div> : (
        <ul>
          {trolleys.map(t => (
            <li key={t.id} onClick={() => getTrolley(t.id)}>
              {t.name} - {t.airline}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 3. useItems
**Purpose**: CRUD operations for items with image support

**Location**: `src/hooks/useItems.ts`

### Returns
```typescript
{
  item: TrolleyItem | null;
  items: TrolleyItem[];
  isLoading: boolean;
  error: string | null;
  getItem: (id: number) => Promise<void>;
  listItems: (page?: number, search?: string) => Promise<void>;
  createItem: (data: any, image?: File) => Promise<void>;
  updateItem: (id: number, data: any, image?: File) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  searchItems: (query: string) => Promise<void>;
  getItemBySku: (sku: string) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  decreaseQuantity: (id: number, quantity: number) => Promise<void>;
  clearError: () => void;
}
```

### Usage
```typescript
import { useItems } from '@/hooks/useItems';

export function ItemForm() {
  const { createItem, updateItem, isLoading, error } = useItems();

  const handleCreate = async (formData) => {
    const file = formData.image as File;
    await createItem({
      name: formData.name,
      sku: formData.sku,
      quantity: formData.quantity,
      level: formData.level,
      price: formData.price,
    }, file);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreate(Object.fromEntries(new FormData(e.currentTarget)));
    }}>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {/* Form fields */}
    </form>
  );
}
```

---

## 4. useLevels
**Purpose**: CRUD operations for trolley levels

**Location**: `src/hooks/useLevels.ts`

### Returns
```typescript
{
  level: TrolleyLevel | null;
  levels: TrolleyLevel[];
  isLoading: boolean;
  error: string | null;
  getLevel: (id: number) => Promise<void>;
  listLevels: (page?: number, search?: string) => Promise<void>;
  createLevel: (data: any) => Promise<void>;
  updateLevel: (id: number, data: any) => Promise<void>;
  deleteLevel: (id: number) => Promise<void>;
  getLevelItems: (levelId: number) => Promise<void>;
  addItemToLevel: (levelId: number, itemData: any) => Promise<void>;
  clearError: () => void;
}
```

---

## 5. useQRData
**Purpose**: CRUD operations for QR data

**Location**: `src/hooks/useQRData.ts`

### Returns
```typescript
{
  qrData: QRData | null;
  qrDataList: QRData[];
  isLoading: boolean;
  error: string | null;
  getQRData: (id: number) => Promise<void>;
  listQRData: (page?: number, search?: string) => Promise<void>;
  createQRData: (data: any) => Promise<void>;
  updateQRData: (id: number, data: any) => Promise<void>;
  deleteQRData: (id: number) => Promise<void>;
  getLatestQRData: () => Promise<void>;
  clearError: () => void;
}
```

---

## 6. useDrawer ⭐ NEW
**Purpose**: Drawer management for trolley systems

**Location**: `src/hooks/useDrawer.ts`

### Returns
```typescript
{
  drawer: DrawerData | null;
  drawers: DrawerData[];
  isLoading: boolean;
  error: string | null;
  getDrawerById: (drawerId: string) => Promise<void>;
  getDrawer: (id: number) => Promise<void>;
  listDrawers: (page?: number, search?: string) => Promise<void>;
  createDrawer: (data: any) => Promise<void>;
  getDrawerSensorData: (id: number, alertFlag?: string) => Promise<any>;
  clearError: () => void;
}
```

### DrawerData Structure
```typescript
interface DrawerData {
  id: number;
  trolley: number;          // Trolley ID
  trolley_name: string;
  drawer_id: string;        // e.g., "DRW_013"
  level: number;
  level_display: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### Usage
```typescript
import { useDrawer } from '@/hooks/useDrawer';

export function DrawerMonitor() {
  const { drawer, getDrawerById, getDrawerSensorData } = useDrawer();

  const handleDrawerSelect = async (drawerId: string) => {
    await getDrawerById(drawerId);
    // drawer.id will be populated, you can use it for sensor data
  };

  return (
    <div>
      <button onClick={() => handleDrawerSelect('DRW_013')}>
        Load Drawer DRW_013
      </button>
      {drawer && (
        <div>
          <h3>{drawer.drawer_id} - Level {drawer.level}</h3>
          <p>Trolley: {drawer.trolley_name}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 7. useSensorData ⭐ NEW
**Purpose**: Real-time sensor monitoring and alerts

**Location**: `src/hooks/useSensorData.ts`

### Returns
```typescript
{
  readings: SensorDataRecord[];
  alerts: SensorDataRecord[];
  isLoading: boolean;
  error: string | null;
  listSensorData: (page?: number) => Promise<void>;
  getSensorDataByDrawer: (drawerId: string) => Promise<void>;
  getSensorDataByFlight: (flightNumber: string) => Promise<void>;
  getAlerts: () => Promise<void>;
  filterSensorData: (filters?: any) => Promise<void>;
  clearError: () => void;
}
```

### SensorDataRecord Structure
```typescript
interface SensorDataRecord {
  id: number;
  stream_id: string;
  timestamp: string;
  station_id: string;
  drawer: number;
  spec_id: string;
  sensor_type: 'camera' | 'barcode' | 'rfid' | 'scale' | 'other';
  expected_value: string;
  detected_value: string;
  deviation_score: number;
  alert_flag: 'OK' | 'Alert';      // Important for filtering
  operator_id: string;
  flight_number: string;
  customer_name: string;
  trolley_name: string;
  created_at: string;
  updated_at: string;
}
```

### Usage Examples

#### Get all alerts
```typescript
import { useSensorData } from '@/hooks/useSensorData';

export function AlertDashboard() {
  const { alerts, getAlerts, isLoading } = useSensorData();

  useEffect(() => {
    getAlerts(); // Only retrieves alert_flag='Alert'
  }, []);

  return (
    <div>
      {isLoading ? <p>Loading...</p> : (
        <ul>
          {alerts.map(a => (
            <li key={a.id} style={{color: a.alert_flag === 'Alert' ? 'red' : 'green'}}>
              {a.sensor_type}: {a.expected_value} vs {a.detected_value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Monitor specific drawer
```typescript
export function DrawerSensorMonitor({ drawerId }) {
  const { readings, getSensorDataByDrawer } = useSensorData();

  useEffect(() => {
    getSensorDataByDrawer(drawerId);
  }, [drawerId]);

  return (
    <div>
      <h3>Drawer {drawerId} Sensors</h3>
      {readings.map(r => (
        <div key={r.id}>
          <span>{r.sensor_type}</span>
          <span>{r.deviation_score.toFixed(2)}</span>
          <span style={{
            color: r.alert_flag === 'Alert' ? 'red' : 'green'
          }}>
            {r.alert_flag}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### Filter by multiple criteria
```typescript
export function SensorFilter() {
  const { readings, filterSensorData } = useSensorData();

  const handleFilter = async () => {
    await filterSensorData({
      alert_flag: 'Alert',
      flight_number: 'QR117',
      sensor_type: 'camera'
    });
  };

  return (
    <div>
      <button onClick={handleFilter}>Find Camera Alerts on QR117</button>
      {/* Display readings */}
    </div>
  );
}
```

---

## 8. useTrolleyContents ⭐ NEW
**Purpose**: Inventory verification - get required contents for trolleys

**Location**: `src/hooks/useTrolleyContents.ts`

### Returns
```typescript
{
  contents: TrolleyRequiredContents | null;
  isLoading: boolean;
  error: string | null;
  getTrolleyContents: (trolleyId: number) => Promise<void>;
  // Helper methods
  getProductsByLevel: (levelNumber: 1 | 2 | 3) => TrolleyProduct[];
  getProductsByDrawer: (drawerId: string) => TrolleyProduct[];
  getTotalItemsInTrolley: () => number;
  getTotalQuantityInTrolley: () => number;
  clearError: () => void;
}
```

### TrolleyRequiredContents Structure
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

interface TrolleyProduct {
  product_id: number;
  product_name: string;
  sku: string;
  category: string;
  required_quantity: number;
  price: number;
  image: string;
}
```

### Usage
```typescript
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

export function TrolleyInventory({ trolleyId }: { trolleyId: number }) {
  const {
    contents,
    isLoading,
    getTrolleyContents,
    getProductsByLevel,
    getTotalQuantityInTrolley,
  } = useTrolleyContents();

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading...</p>;
  if (!contents) return null;

  return (
    <div>
      <h2>{contents.trolley_name}</h2>
      <p>Airline: {contents.airline}</p>
      <p>Total Items: {contents.total_items}</p>
      <p>Total Quantity: {getTotalQuantityInTrolley()}</p>

      {/* Display products by level */}
      {[1, 2, 3].map((level) => {
        const products = getProductsByLevel(level as 1 | 2 | 3);
        if (products.length === 0) return null;

        return (
          <div key={level}>
            <h3>Level {level}</h3>
            <ul>
              {products.map((p) => (
                <li key={p.product_id}>
                  {p.product_name} - {p.required_quantity}x (${p.price})
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

### Helper Methods

#### getProductsByLevel(levelNumber: 1 | 2 | 3)
Get all products assigned to a specific level.

```typescript
const level1Products = getProductsByLevel(1);
console.log(level1Products); // Array of TrolleyProduct
```

#### getProductsByDrawer(drawerId: string)
Get all products assigned to a specific drawer.

```typescript
const drawerProducts = getProductsByDrawer('DRW_013');
```

#### getTotalItemsInTrolley()
Get total number of unique items.

```typescript
const totalItems = getTotalItemsInTrolley(); // 5
```

#### getTotalQuantityInTrolley()
Get total quantity across all items.

```typescript
const totalQuantity = getTotalQuantityInTrolley(); // 135
```

**For detailed usage and 5 practical examples, see [TROLLEY_CONTENTS.md](TROLLEY_CONTENTS.md)**

---

## 9. useWebSocket
**Purpose**: Original WebSocket hook for QR data streaming

**Location**: `src/hooks/useWebSocket.ts`

### Returns
```typescript
{
  isConnected: boolean;
  qrDataList: QRData[];
  totalCount: number;
  lastUpdate: Date | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  error: string | null;
}
```

---

## Best Practices

### 1. Always Clear Errors
```typescript
const { error, clearError } = useMyHook();

useEffect(() => {
  // Show error
}, [error]);

// Clear on component unmount
useEffect(() => {
  return () => clearError();
}, []);
```

### 2. Handle Loading States
```typescript
const { isLoading, error } = useMyHook();

if (isLoading) return <Spinner />;
if (error) return <ErrorAlert message={error} />;
```

### 3. Manage Dependencies Properly
```typescript
const { getData } = useMyHook();

useEffect(() => {
  getData();
}, [getData]); // Include hook method in dependencies
```

### 4. Use TypeScript for Safety
```typescript
import type { DrawerData, SensorDataRecord } from '@/hooks/useDrawer';
import type { TrolleyDetail } from '@/types/api';

// Provides full IDE autocomplete and type checking
```

---

## Common Patterns

### Pattern 1: Load and Display
```typescript
const [id, setId] = useState<number | null>(null);
const { item, getItem, isLoading } = useItems();

useEffect(() => {
  if (id) getItem(id);
}, [id]);
```

### Pattern 2: Create with File Upload
```typescript
const { createItem, isLoading } = useItems();

const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  const formData = new FormData(event.currentTarget);
  const image = formData.get('image') as File;

  await createItem({
    name: formData.get('name'),
    sku: formData.get('sku'),
    // ... other fields
  }, image);
};
```

### Pattern 3: Real-time Monitoring
```typescript
const { readings, getSensorDataByDrawer } = useSensorData();

useEffect(() => {
  getSensorDataByDrawer(drawerId);

  // Refresh every 30 seconds
  const interval = setInterval(() => {
    getSensorDataByDrawer(drawerId);
  }, 30000);

  return () => clearInterval(interval);
}, [drawerId]);
```

---

## Error Handling

All hooks follow this error pattern:

```typescript
try {
  // API call
  if (response.error) {
    setError(response.error);
    return;
  }

  if (response.data) {
    // Update state
  }
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
}
```

Common errors:
- Network errors
- 404 Not Found
- 401 Unauthorized
- 500 Server Error
- Validation errors

---

**Last Updated**: 2025-10-26
**Version**: 2.1.0
**Total Hooks**: 9 (all production-ready) ✅

## Hooks Summary

| # | Hook | Purpose | Status |
|---|------|---------|--------|
| 1 | useTrolleyWebSocket | Real-time trolley data via WebSocket | ✨ Enhanced |
| 2 | useTrolleys | Trolley CRUD operations | ✅ |
| 3 | useItems | Item CRUD with image upload | ✅ |
| 4 | useLevels | Level management | ✅ |
| 5 | useQRData | QR data CRUD | ✅ |
| 6 | useDrawer | Drawer management | ⭐ New |
| 7 | useSensorData | Sensor monitoring and alerts | ⭐ New |
| 8 | useTrolleyContents | Inventory verification | ⭐ New |
| 9 | useWebSocket | Original WebSocket implementation | ✅ |
