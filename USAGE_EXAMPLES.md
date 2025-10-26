# Ejemplos de Uso - Trolley Manager API

## 1. Usar Trolleys Hook

### Fetch básico
```typescript
import { useTrolleys } from '@/hooks/useTrolleys';

export function TrolleysList() {
  const { trolleys, loading, error, fetchTrolleys } = useTrolleys();

  useEffect(() => {
    fetchTrolleys();
  }, [fetchTrolleys]);

  if (loading) return <div>Cargando trolleys...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {trolleys.map(t => (
        <li key={t.id}>{t.name} - {t.airline}</li>
      ))}
    </ul>
  );
}
```

### Crear nuevo trolley
```typescript
export function CreateTrolley() {
  const { createTrolley, loading, error } = useTrolleys();

  const handleCreate = async () => {
    await createTrolley({
      name: "Beverage Trolley",
      airline: "Aeromexico",
      description: "Para bebidas en vuelos nacionales",
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creando...' : 'Crear Trolley'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

### Actualizar y eliminar
```typescript
export function TrolleyActions({ trolleyId }) {
  const { updateTrolley, deleteTrolley, loading } = useTrolleys();

  const handleUpdate = async () => {
    await updateTrolley(trolleyId, {
      name: "Updated Name",
      airline: "Updated Airline",
    });
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro?')) {
      await deleteTrolley(trolleyId);
    }
  };

  return (
    <div>
      <button onClick={handleUpdate} disabled={loading}>Actualizar</button>
      <button onClick={handleDelete} disabled={loading}>Eliminar</button>
    </div>
  );
}
```

### Fetch de niveles
```typescript
export function TrolleyLevels({ trolleyId }) {
  const { fetchTrolleyLevels, createTrolleyLevel } = useTrolleys();
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    fetchTrolleyLevels(trolleyId).then(setLevels);
  }, [trolleyId, fetchTrolleyLevels]);

  const handleAddLevel = async () => {
    await createTrolleyLevel(trolleyId, {
      name: "Level 1",
      level_number: 1,
      capacity: 20,
    });
  };

  return (
    <div>
      <h3>Niveles del Trolley</h3>
      <ul>
        {levels?.map(l => (
          <li key={l.id}>{l.name} (Cap: {l.capacity})</li>
        ))}
      </ul>
      <button onClick={handleAddLevel}>Agregar Nivel</button>
    </div>
  );
}
```

## 2. Usar Items Hook

### Listar items
```typescript
import { useItems } from '@/hooks/useItems';

export function ItemsList() {
  const { items, loading, error, fetchItems } = useItems();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div>
      {loading && <p>Cargando items...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>SKU</th>
            <th>Cantidad</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{item.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Crear item con imagen
```typescript
export function CreateItemForm() {
  const { createItem, loading } = useItems();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
  });
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createItem({
      ...formData,
      available: true,
    }, image || undefined);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="text"
        placeholder="SKU"
        value={formData.sku}
        onChange={e => setFormData({...formData, sku: e.target.value})}
      />
      <input
        type="text"
        placeholder="Categoría"
        value={formData.category}
        onChange={e => setFormData({...formData, category: e.target.value})}
      />
      <input
        type="number"
        placeholder="Cantidad"
        value={formData.quantity}
        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Item'}
      </button>
    </form>
  );
}
```

### Gestionar inventario
```typescript
export function InventoryControl({ itemId, currentQuantity }) {
  const { updateQuantity, decreaseQuantity, loading } = useItems();

  return (
    <div>
      <p>Cantidad actual: {currentQuantity}</p>
      <input
        type="number"
        defaultValue={currentQuantity}
        onChange={e => {
          const newQty = parseInt(e.target.value);
          updateQuantity(itemId, newQty);
        }}
        disabled={loading}
      />
      <button
        onClick={() => decreaseQuantity(itemId, 1)}
        disabled={loading}
      >
        Disminuir uno
      </button>
      <button
        onClick={() => decreaseQuantity(itemId, 5)}
        disabled={loading}
      >
        Disminuir 5
      </button>
    </div>
  );
}
```

### Buscar items
```typescript
export function ItemSearch() {
  const { searchItems, items, loading } = useItems();
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchItems(query);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Buscar item..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Buscar
      </button>
      {items.map(item => (
        <div key={item.id}>
          <h4>{item.name}</h4>
          <p>SKU: {item.sku}</p>
        </div>
      ))}
    </form>
  );
}
```

## 3. Usar Levels Hook

### Listar niveles
```typescript
import { useLevels } from '@/hooks/useLevels';

export function LevelsList() {
  const { levels, fetchLevels, loading } = useLevels();

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return (
    <div>
      {loading && <p>Cargando niveles...</p>}
      {levels.map(level => (
        <div key={level.id}>
          <h3>{level.name}</h3>
          <p>Nivel: {level.level_number}</p>
          <p>Capacidad: {level.capacity}</p>
          <p>Items: {level.items?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}
```

### Ver items de un nivel
```typescript
export function LevelItems({ levelId }) {
  const { getLevelItems } = useLevels();
  const [level, setLevel] = useState(null);

  useEffect(() => {
    getLevelItems(levelId).then(setLevel);
  }, [levelId, getLevelItems]);

  return (
    <div>
      <h3>{level?.name}</h3>
      <ul>
        {level?.items?.map(item => (
          <li key={item.id}>
            {item.name} (Qty: {item.quantity})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Agregar item a nivel
```typescript
export function AddItemToLevel({ levelId }) {
  const { addItemToLevel, loading } = useLevels();
  const [itemId, setItemId] = useState('');

  const handleAdd = async () => {
    await addItemToLevel(levelId, {
      id: parseInt(itemId),
      name: 'Item',
      sku: 'SKU',
      category: 'Cat',
      quantity: 0,
      available: true,
    });
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Item ID"
        value={itemId}
        onChange={e => setItemId(e.target.value)}
      />
      <button onClick={handleAdd} disabled={loading}>
        Agregar Item
      </button>
    </div>
  );
}
```

## 4. Usar QR Data Hook

### Listar QR data
```typescript
import { useQRData } from '@/hooks/useQRData';

export function QRDataList() {
  const { qrDataList, fetchQRData, loading } = useQRData();

  useEffect(() => {
    fetchQRData();
  }, [fetchQRData]);

  return (
    <div>
      {loading && <p>Cargando QR data...</p>}
      <table>
        <thead>
          <tr>
            <th>Station ID</th>
            <th>Flight Number</th>
            <th>Customer</th>
            <th>Drawer ID</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {qrDataList.map(qr => (
            <tr key={qr.id}>
              <td>{qr.station_id}</td>
              <td>{qr.flight_number}</td>
              <td>{qr.customer_name}</td>
              <td>{qr.drawer_id}</td>
              <td>{new Date(qr.created_at!).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Crear QR data
```typescript
export function CreateQRData() {
  const { createQRData, loading } = useQRData();
  const [formData, setFormData] = useState({
    station_id: '',
    flight_number: '',
    customer_name: '',
    drawer_id: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createQRData(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Station ID"
        value={formData.station_id}
        onChange={e => setFormData({...formData, station_id: e.target.value})}
      />
      <input
        type="text"
        placeholder="Flight Number"
        value={formData.flight_number}
        onChange={e => setFormData({...formData, flight_number: e.target.value})}
      />
      <input
        type="text"
        placeholder="Customer Name"
        value={formData.customer_name}
        onChange={e => setFormData({...formData, customer_name: e.target.value})}
      />
      <input
        type="text"
        placeholder="Drawer ID"
        value={formData.drawer_id}
        onChange={e => setFormData({...formData, drawer_id: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear QR Data'}
      </button>
    </form>
  );
}
```

### Obtener último QR
```typescript
export function LatestQR() {
  const { latestQRData, fetchLatestQRData } = useQRData();

  useEffect(() => {
    // Poll every 5 seconds
    const interval = setInterval(fetchLatestQRData, 5000);
    return () => clearInterval(interval);
  }, [fetchLatestQRData]);

  return (
    <div>
      <h3>Último QR Leído</h3>
      {latestQRData ? (
        <div>
          <p>Flight: {latestQRData.flight_number}</p>
          <p>Station: {latestQRData.station_id}</p>
          <p>Time: {new Date(latestQRData.created_at!).toLocaleString()}</p>
        </div>
      ) : (
        <p>No hay datos QR</p>
      )}
    </div>
  );
}
```

## 5. Usar Services Directamente

### Sin hooks (para acciones sin estado)
```typescript
import { TrolleyService } from '@/services/trolley.service';
import { ItemService } from '@/services/item.service';
import { QRDataService } from '@/services/qr-data.service';

// Fetch one-off data
async function getTrolleyData(trolleyId: number) {
  const response = await TrolleyService.getTrolley(trolleyId);

  if (response.error) {
    console.error('Error:', response.error);
    return null;
  }

  return response.data;
}

// Search items by SKU
async function findItemBySku(sku: string) {
  const response = await ItemService.getItemBySku(sku);
  return response.data || null;
}

// Create bulk QR data
async function createMultipleQRRecords(records: QRData[]) {
  return Promise.all(
    records.map(record => QRDataService.createQRData(record))
  );
}
```

## 6. Errores Comunes

### Verificar siempre el error
```typescript
const { items, error, fetchItems } = useItems();

useEffect(() => {
  fetchItems();
}, [fetchItems]);

// ❌ Incorrecto
{items.map(item => <div>{item.name}</div>)}

// ✅ Correcto
{error && <p>Error: {error}</p>}
{items.length === 0 && !loading && <p>No hay items</p>}
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### Configurar token de autenticación
```typescript
import { apiClient } from '@/lib/api-client';

// Al login
async function login(username: string, password: string) {
  const response = await fetch('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    apiClient.setAuthToken(data.access);
  }
}

// Al logout
function logout() {
  apiClient.clearAuthToken();
}
```

## 7. Patrón completo en componente

```typescript
import { useTrolleys } from '@/hooks/useTrolleys';
import { useItems } from '@/hooks/useItems';

export function CompleteExample() {
  const trolleys = useTrolleys();
  const items = useItems();

  useEffect(() => {
    trolleys.fetchTrolleys();
    items.fetchItems();
  }, [trolleys, items]);

  if (trolleys.loading || items.loading) {
    return <div>Cargando...</div>;
  }

  if (trolleys.error || items.error) {
    return (
      <div>
        {trolleys.error && <p>Error trolleys: {trolleys.error}</p>}
        {items.error && <p>Error items: {items.error}</p>}
      </div>
    );
  }

  return (
    <div>
      <section>
        <h2>Trolleys ({trolleys.trolleys.length})</h2>
        {trolleys.trolleys.map(t => (
          <div key={t.id}>{t.name}</div>
        ))}
      </section>

      <section>
        <h2>Items ({items.items.length})</h2>
        {items.items.map(i => (
          <div key={i.id}>{i.name}</div>
        ))}
      </section>
    </div>
  );
}
```

Estos ejemplos cubren la mayoría de casos de uso. ¡Ajusta según tus necesidades!
