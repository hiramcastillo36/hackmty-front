# API Integration - Trolley Manager

## Overview

This project integrates with the Trolleys API (v1.0.0) to manage airline trolley inventory including items, levels, QR data, and trolley management.

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Or set it to your production API URL:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
```

### Optional Authentication

If your API requires authentication, you can set the token programmatically:

```typescript
import { apiClient } from '@/lib/api-client';

apiClient.setAuthToken('your-token-here');
```

## Project Structure

### Types (`/src/types/`)
- `api.ts` - All TypeScript types generated from OpenAPI spec

### Services (`/src/services/`)
- `trolley.service.ts` - Trolley CRUD operations
- `item.service.ts` - Item/Product CRUD operations
- `level.service.ts` - Level management
- `qr-data.service.ts` - QR data operations

### Hooks (`/src/hooks/`)
- `useTrolleys.ts` - React hook for trolley operations
- `useItems.ts` - React hook for item operations
- `useLevels.ts` - React hook for level operations
- `useQRData.ts` - React hook for QR data operations

### API Client (`/src/lib/`)
- `api-client.ts` - Base API client with fetch wrapper

## Usage Examples

### Using Trolley Hook

```typescript
import { useTrolleys } from '@/hooks/useTrolleys';

export function MyComponent() {
  const {
    trolleys,
    loading,
    error,
    fetchTrolleys,
    createTrolley,
    updateTrolley,
    deleteTrolley,
  } = useTrolleys();

  useEffect(() => {
    fetchTrolleys(); // Fetch all trolleys
  }, [fetchTrolleys]);

  const handleCreate = async () => {
    await createTrolley({
      name: "Beverage Trolley",
      airline: "Aeromexico",
      description: "Trolley for beverages",
    });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {trolleys.map(trolley => (
        <div key={trolley.id}>{trolley.name}</div>
      ))}
      <button onClick={handleCreate}>Create Trolley</button>
    </div>
  );
}
```

### Using Items Hook

```typescript
import { useItems } from '@/hooks/useItems';

export function ItemsComponent() {
  const {
    items,
    loading,
    fetchItems,
    createItem,
    updateQuantity,
    decreaseQuantity,
  } = useItems();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>Quantity: {item.quantity}</p>
          <button
            onClick={() => updateQuantity(item.id!, 10)}
          >
            Set to 10
          </button>
          <button
            onClick={() => decreaseQuantity(item.id!, 1)}
          >
            Decrease
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Using Services Directly

```typescript
import { TrolleyService } from '@/services/trolley.service';
import { ItemService } from '@/services/item.service';

// Fetch trolleys
const response = await TrolleyService.listTrolleys(1, 'search term');
if (response.error) {
  console.error('Error:', response.error);
} else {
  console.log('Trolleys:', response.data);
}

// Create item with image
const formData = new FormData();
formData.append('name', 'New Item');
// ... add other fields
const file = fileInputElement.files[0];

const itemResponse = await ItemService.createItem(
  {
    name: 'New Item',
    sku: 'SKU123',
    category: 'Beverages',
    quantity: 10,
    available: true,
  },
  file
);
```

## API Endpoints

### Trolleys
- `GET /api/trolleys/` - List trolleys (paginated)
- `POST /api/trolleys/` - Create trolley
- `GET /api/trolleys/{id}/` - Get trolley details
- `PUT /api/trolleys/{id}/` - Update trolley
- `PATCH /api/trolleys/{id}/` - Partial update
- `DELETE /api/trolleys/{id}/` - Delete trolley
- `GET /api/trolleys/{id}/levels/` - Get levels
- `POST /api/trolleys/{id}/levels/` - Create level
- `GET /api/trolleys/{id}/stats/` - Get statistics

### Items
- `GET /api/items/` - List items (paginated)
- `POST /api/items/` - Create item (with optional image)
- `GET /api/items/{id}/` - Get item details
- `PUT /api/items/{id}/` - Update item
- `PATCH /api/items/{id}/` - Partial update
- `DELETE /api/items/{id}/` - Delete item
- `GET /api/items/sku/{sku}/` - Get item by SKU
- `GET /api/items/search/?query=term` - Search items
- `POST /api/items/{id}/update-quantity/` - Update quantity
- `POST /api/items/{id}/decrease-quantity/` - Decrease quantity

### Levels
- `GET /api/levels/` - List levels (paginated)
- `POST /api/levels/` - Create level
- `GET /api/levels/{id}/` - Get level details
- `PUT /api/levels/{id}/` - Update level
- `PATCH /api/levels/{id}/` - Partial update
- `DELETE /api/levels/{id}/` - Delete level
- `GET /api/levels/{id}/items/` - Get items in level
- `POST /api/levels/{id}/items/` - Add item to level

### QR Data
- `GET /api/qr-data/` - List QR data (paginated)
- `POST /api/qr-data/` - Create QR record
- `GET /api/qr-data/{id}/` - Get QR record
- `PUT /api/qr-data/{id}/` - Update QR record
- `PATCH /api/qr-data/{id}/` - Partial update
- `DELETE /api/qr-data/{id}/` - Delete QR record
- `GET /api/qr-data/latest/` - Get latest QR record

## Features

### Implemented
- ✅ Full CRUD for Trolleys
- ✅ Full CRUD for Items with image upload support
- ✅ Full CRUD for Levels
- ✅ QR Data management
- ✅ Search functionality (items by SKU, general search)
- ✅ Pagination support
- ✅ Error handling and loading states
- ✅ React hooks for easy integration
- ✅ TypeScript support with full type safety
- ✅ Bearer token authentication support

### Optional Features
- Error boundaries (can be added as needed)
- Caching layer (can be added with React Query)
- Real-time updates (can be added with WebSocket)
- Offline support (can be added with IndexedDB)

## Error Handling

All service methods return an `ApiClientResponse<T>` which contains:

```typescript
{
  data?: T;          // The response data if successful
  error?: string;    // Error message if failed
  status: number;    // HTTP status code
}
```

Always check for errors:

```typescript
const response = await TrolleyService.getTrolley(1);
if (response.error) {
  console.error('Failed to fetch trolley:', response.error);
} else {
  console.log('Trolley:', response.data);
}
```

## Authentication

To add authentication headers:

```typescript
import { apiClient } from '@/lib/api-client';

// Set token
apiClient.setAuthToken('your-jwt-token');

// Clear token
apiClient.clearAuthToken();
```

## Next Steps

1. Set up your `.env.local` file with your API URL
2. Test the API connection by clicking "Usar API" button in the UI
3. Monitor console and error messages for any connectivity issues
4. Customize the hooks and services as needed for your specific use case

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure your API server has proper CORS headers configured.

### Connection Refused
Check that your `NEXT_PUBLIC_API_BASE_URL` is correct and the API server is running.

### Authentication Errors
Verify that your auth token is valid and being sent correctly with `apiClient.setAuthToken()`.

## API Documentation

For detailed API documentation, refer to the OpenAPI specification at:
`/api/schema/` (JSON) or `/api/schema/?format=yaml` (YAML)
