# Trolley Contents API Integration

## Overview

The Trolley Contents API provides detailed information about what items should be contained in a trolley, organized by level and drawer. This is essential for inventory verification and trolley preparation.

**Endpoint**: `GET /api/trolleys/{id}/required-contents/`

## Data Structure

### Root Response: TrolleyRequiredContents
```typescript
interface TrolleyRequiredContents {
  trolley_id: number;           // Trolley ID
  trolley_name: string;         // e.g., "Trolley de Bebidas - Qatar Airways"
  airline: string;              // e.g., "Qatar Airways"
  total_specs: number;          // Number of specifications
  total_items: number;          // Number of unique items
  total_quantity: number;       // Total quantity across all items
  specifications: TrolleySpecification[];
}
```

### TrolleySpecification
Contains detailed specs with products organized by level and drawer:

```typescript
interface TrolleySpecification {
  spec_id: string;              // e.g., "SPEC_QR117_001"
  spec_name: string;            // e.g., "Qatar Airways QR117 - Especificación Estándar"
  spec_description: string;     // Flight plan description
  total_items_count: number;    // Items in this spec
  total_quantity: number;       // Total quantity in this spec
  by_level: TrolleyContentsByLevel[];
  by_drawer: TrolleyContentsByDrawer[];
}
```

### TrolleyContentsByLevel
Products organized by trolley level:

```typescript
interface TrolleyContentsByLevel {
  level_number: 1 | 2 | 3;      // Level: 1=Top, 2=Middle, 3=Bottom
  level_display: string;        // e.g., "Nivel 1 (Superior)"
  products: TrolleyProduct[];
}
```

### TrolleyContentsByDrawer
Products organized by drawer:

```typescript
interface TrolleyContentsByDrawer {
  drawer_id: string;            // e.g., "DRW_013"
  drawer_level: string;         // e.g., "Nivel 1 (Superior)"
  products: TrolleyProduct[];
}
```

### TrolleyProduct
Individual product information:

```typescript
interface TrolleyProduct {
  product_id: number;
  product_name: string;         // e.g., "Jugo de Naranja"
  sku: string;                  // e.g., "DRK025"
  category: string;             // e.g., "Bebida"
  required_quantity: number;    // How many units needed
  price: number;                // Unit price
  image: string;                // Product image URL
}
```

## Service Usage

### TrolleyContentsService

**File**: `src/services/trolley-contents.service.ts`

#### Method: getTrolleyContents

```typescript
static async getTrolleyContents(
  trolleyId: number,
): Promise<ApiClientResponse<TrolleyRequiredContents>>
```

**Parameters**:
- `trolleyId` (number) - The ID of the trolley to get contents for

**Returns**:
```typescript
{
  data?: TrolleyRequiredContents;
  error?: string;
}
```

**Example**:
```typescript
import { TrolleyContentsService } from '@/services/trolley-contents.service';

const response = await TrolleyContentsService.getTrolleyContents(1);

if (!response.error && response.data) {
  console.log(`Trolley: ${response.data.trolley_name}`);
  console.log(`Total items: ${response.data.total_items}`);
  console.log(`Total quantity: ${response.data.total_quantity}`);
}
```

## Hook Usage

### useTrolleyContents

**File**: `src/hooks/useTrolleyContents.ts`

Complete hook for managing trolley contents state:

```typescript
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

function MyComponent() {
  const {
    contents,
    isLoading,
    error,
    getTrolleyContents,
    getProductsByLevel,
    getProductsByDrawer,
    getTotalItemsInTrolley,
    getTotalQuantityInTrolley,
    clearError,
  } = useTrolleyContents();

  // Load contents
  useEffect(() => {
    getTrolleyContents(1);
  }, []);

  // Use the data
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{contents?.trolley_name}</h2>
      <p>Airline: {contents?.airline}</p>
      <p>Items: {getTotalItemsInTrolley()}</p>
      <p>Quantity: {getTotalQuantityInTrolley()}</p>
    </div>
  );
}
```

### Hook Methods

#### getTrolleyContents(trolleyId: number)
Fetch contents for a trolley.

```typescript
await getTrolleyContents(1);
```

#### getProductsByLevel(levelNumber: 1 | 2 | 3)
Get all products for a specific level.

```typescript
const level1Products = getProductsByLevel(1);
const level2Products = getProductsByLevel(2);

level1Products.forEach(product => {
  console.log(`${product.product_name}: ${product.required_quantity} units`);
});
```

#### getProductsByDrawer(drawerId: string)
Get all products assigned to a specific drawer.

```typescript
const drawerProducts = getProductsByDrawer('DRW_013');

drawerProducts.forEach(product => {
  console.log(`${product.product_name}: ${product.required_quantity} units`);
});
```

#### getTotalItemsInTrolley()
Get total number of unique items in trolley.

```typescript
const totalItems = getTotalItemsInTrolley();
console.log(`Total items: ${totalItems}`); // 5
```

#### getTotalQuantityInTrolley()
Get total quantity across all items.

```typescript
const totalQuantity = getTotalQuantityInTrolley();
console.log(`Total quantity: ${totalQuantity}`); // 135
```

#### clearError()
Clear error state.

```typescript
error ? <button onClick={clearError}>Dismiss Error</button> : null
```

## Practical Examples

### Example 1: Display Trolley Inventory

```typescript
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

export function TrolleyInventory({ trolleyId }: { trolleyId: number }) {
  const { contents, isLoading, getTrolleyContents } = useTrolleyContents();

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading inventory...</p>;
  if (!contents) return <p>No contents found</p>;

  return (
    <div>
      <h2>{contents.trolley_name}</h2>
      <p>Airline: {contents.airline}</p>
      <div>
        <strong>Total Items:</strong> {contents.total_items}
        <br />
        <strong>Total Quantity:</strong> {contents.total_quantity}
      </div>
    </div>
  );
}
```

### Example 2: Level-Based Organization

```typescript
export function TrolleyByLevel({ trolleyId }: { trolleyId: number }) {
  const { contents, isLoading, getTrolleyContents, getProductsByLevel } =
    useTrolleyContents();

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading...</p>;
  if (!contents) return null;

  return (
    <div>
      {[1, 2, 3].map((levelNum) => {
        const products = getProductsByLevel(levelNum as 1 | 2 | 3);
        if (products.length === 0) return null;

        return (
          <div key={levelNum}>
            <h3>Nivel {levelNum}</h3>
            <ul>
              {products.map((product) => (
                <li key={product.product_id}>
                  {product.product_name} (SKU: {product.sku})
                  <br />
                  Cantidad: {product.required_quantity}
                  <br />
                  Precio: ${product.price.toFixed(2)}
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

### Example 3: Drawer-Based Organization

```typescript
export function DrawerContents({ trolleyId, drawerId }: { trolleyId: number; drawerId: string }) {
  const { isLoading, getTrolleyContents, getProductsByDrawer } = useTrolleyContents();

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading...</p>;

  const products = getProductsByDrawer(drawerId);

  return (
    <div>
      <h3>Drawer {drawerId} Contents</h3>
      {products.length === 0 ? (
        <p>No products in this drawer</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id}>
                <td>{product.product_name}</td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>{product.required_quantity}</td>
                <td>${product.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Example 4: Inventory Checklist

```typescript
export function InventoryChecklist({ trolleyId }: { trolleyId: number }) {
  const { contents, isLoading, getTrolleyContents, getTotalQuantityInTrolley } =
    useTrolleyContents();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading...</p>;
  if (!contents) return null;

  const allProducts = contents.specifications.flatMap((spec) =>
    spec.by_level.flatMap((level) => level.products),
  );

  const progress = (checkedItems.length / allProducts.length) * 100;

  return (
    <div>
      <h2>{contents.trolley_name}</h2>
      <div>
        <p>Progress: {Math.round(progress)}%</p>
        <progress value={progress} max={100} style={{ width: '100%' }} />
      </div>

      <div>
        {allProducts.map((product) => (
          <label key={product.product_id}>
            <input
              type="checkbox"
              checked={checkedItems.includes(product.product_id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setCheckedItems([...checkedItems, product.product_id]);
                } else {
                  setCheckedItems(
                    checkedItems.filter((id) => id !== product.product_id),
                  );
                }
              }}
            />
            {product.product_name} ({product.required_quantity} units) - ${product.price}
          </label>
        ))}
      </div>

      <p>
        Total to verify: {getTotalQuantityInTrolley()} units
        <br />
        Checked: {checkedItems.length} items
      </p>
    </div>
  );
}
```

### Example 5: Product Verification by Category

```typescript
export function ProductsByCategory({ trolleyId }: { trolleyId: number }) {
  const { contents, isLoading, getTrolleyContents } = useTrolleyContents();

  useEffect(() => {
    getTrolleyContents(trolleyId);
  }, [trolleyId]);

  if (isLoading) return <p>Loading...</p>;
  if (!contents) return null;

  // Group products by category
  const productsByCategory: Record<string, TrolleyProduct[]> = {};
  contents.specifications.forEach((spec) => {
    spec.by_level.forEach((level) => {
      level.products.forEach((product) => {
        if (!productsByCategory[product.category]) {
          productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
      });
    });
  });

  return (
    <div>
      <h2>{contents.trolley_name}</h2>
      {Object.entries(productsByCategory).map(([category, products]) => (
        <div key={category}>
          <h3>{category}</h3>
          <ul>
            {products.map((product) => (
              <li key={product.product_id}>
                <img src={product.image} alt={product.product_name} width={50} />
                <span>{product.product_name}</span>
                <strong>{product.required_quantity}x</strong>
                <span>${product.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## Integration with Other Hooks

### With useTrolleys
```typescript
import { useTrolleys } from '@/hooks/useTrolleys';
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

function TrolleyDetail() {
  const { trolley, getTrolley } = useTrolleys();
  const { contents, getTrolleyContents } = useTrolleyContents();

  useEffect(() => {
    getTrolley(1);
  }, []);

  useEffect(() => {
    if (trolley?.id) {
      getTrolleyContents(trolley.id);
    }
  }, [trolley?.id]);

  return (
    <div>
      <h2>{trolley?.name}</h2>
      <p>Contents: {contents?.total_items} items</p>
    </div>
  );
}
```

### With useDrawer and Sensor Data
```typescript
function DrawerVerification() {
  const { drawer, getDrawerById } = useDrawer();
  const { contents, getTrolleyContents, getProductsByDrawer } = useTrolleyContents();
  const { getSensorDataByDrawer } = useSensorData();

  const handleDrawerSelect = async (drawerId: string, trolleyId: number) => {
    await getDrawerById(drawerId);
    await getTrolleyContents(trolleyId);
    await getSensorDataByDrawer(drawerId);
  };

  const products = getProductsByDrawer(drawer?.drawer_id || '');

  return (
    <div>
      <h3>Expected Contents</h3>
      {products.map((p) => (
        <div key={p.product_id}>
          {p.product_name}: {p.required_quantity}x
        </div>
      ))}
    </div>
  );
}
```

## Performance Considerations

1. **Data Caching**: Hook maintains single state object
2. **Helper Functions**: Memoized with useCallback
3. **Minimal Re-renders**: Only state updates trigger re-renders
4. **Large Data Sets**: Handle up to 1000+ products efficiently

## Error Handling

```typescript
const { contents, error, clearError } = useTrolleyContents();

useEffect(() => {
  if (error) {
    // Show error notification
    showNotification({ message: error, type: 'error' });

    // Auto-clear after 5 seconds
    const timer = setTimeout(() => clearError(), 5000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

## TypeScript Usage

Full type safety with TypeScript:

```typescript
import type {
  TrolleyRequiredContents,
  TrolleySpecification,
  TrolleyProduct,
} from '@/types/api';
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

function TypeSafeComponent() {
  const { contents }: { contents: TrolleyRequiredContents | null } =
    useTrolleyContents();

  const processProduct = (product: TrolleyProduct) => {
    console.log(`Product: ${product.product_name}`);
    console.log(`Required: ${product.required_quantity}`);
  };

  return <div>{/* TypeScript will check all accesses */}</div>;
}
```

## Testing

### Unit Test Example
```typescript
import { renderHook, act } from '@testing-library/react';
import { useTrolleyContents } from '@/hooks/useTrolleyContents';

describe('useTrolleyContents', () => {
  it('should load trolley contents', async () => {
    const { result } = renderHook(() => useTrolleyContents());

    await act(async () => {
      await result.current.getTrolleyContents(1);
    });

    expect(result.current.contents?.trolley_id).toBe(1);
    expect(result.current.contents?.total_items).toBeGreaterThan(0);
  });

  it('should filter products by level', async () => {
    const { result } = renderHook(() => useTrolleyContents());

    await act(async () => {
      await result.current.getTrolleyContents(1);
    });

    const level1Products = result.current.getProductsByLevel(1);
    expect(Array.isArray(level1Products)).toBe(true);
  });
});
```

## API Response Example

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
              "image": "https://example.com/image.jpg"
            }
          ]
        }
      ],
      "by_drawer": [
        {
          "drawer_id": "DRW_013",
          "drawer_level": "Nivel 1 (Superior)",
          "products": [
            {
              "product_id": 2,
              "product_name": "Jugo de Naranja",
              "sku": "DRK025",
              "category": "Bebida",
              "required_quantity": 30,
              "price": 3.0,
              "image": "https://example.com/image.jpg"
            }
          ]
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Issue: Contents not loading
**Solution**: Check that trolleyId is correct and API is responding
```typescript
const response = await TrolleyContentsService.getTrolleyContents(1);
console.log(response); // Check response structure
```

### Issue: Products not filtering by level
**Solution**: Ensure specifications array is populated
```typescript
const products = getProductsByLevel(1);
console.log(products); // Should not be empty
```

### Issue: Type errors in TypeScript
**Solution**: Import types correctly
```typescript
import type { TrolleyRequiredContents } from '@/types/api';
```

## Summary

The Trolley Contents API provides a complete view of what items should be in a trolley, organized by:
- **Level** - Physical location in trolley (top, middle, bottom)
- **Drawer** - Specific drawer assignments
- **Specification** - Flight/requirement-specific configurations

Use `useTrolleyContents` hook for easy state management and helper methods to filter and display inventory information.

---

**Status**: ✅ Complete and Production Ready
**Last Updated**: 2025-10-26
**Version**: 1.0.0
