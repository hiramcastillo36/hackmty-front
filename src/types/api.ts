/**
 * Tipos generados desde OpenAPI spec
 * API Trolleys - Aerolínea v1.0.0
 */

// ==================== TROLLEY TYPES ====================

export interface TrolleyItem {
  id: number; // readOnly
  level: number; // required, writeOnly
  name: string;
  description?: string;
  sku: string;
  quantity: number; // minimum 0
  image?: string; // uri format
  price?: string; // decimal format
  category: string;
  created_at: string; // readOnly, date-time
  updated_at: string; // readOnly, date-time
}

export interface PatchedTrolleyItem {
  id?: number;
  level?: number;
  name?: string;
  description?: string;
  sku?: string;
  quantity?: number;
  image?: string;
  price?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrolleyLevel {
  id: number; // readOnly
  trolley: number; // required
  level_number: 1 | 2 | 3; // required - enum
  level_display: string; // readOnly
  capacity: number; // required
  description?: string;
  items: TrolleyItem[]; // readOnly
  created_at: string; // readOnly
  updated_at: string; // readOnly
}

export interface PatchedTrolleyLevel {
  id?: number;
  trolley?: number;
  level_number?: 1 | 2 | 3;
  level_display?: string;
  capacity?: number;
  description?: string;
  items?: TrolleyItem[];
  created_at?: string;
  updated_at?: string;
}

export interface TrolleyList {
  id: number; // readOnly
  name: string;
  airline: string;
  level_count: string; // readOnly
  created_at: string; // readOnly
}

export interface TrolleyCreateUpdate {
  id?: number;
  name: string;
  airline: string;
  description?: string;
  status?: string;
}

export interface PatchedTrolleyCreateUpdate {
  id?: number;
  name?: string;
  airline?: string;
  description?: string;
  status?: string;
}

export interface TrolleyDetail extends TrolleyCreateUpdate {
  levels?: TrolleyLevel[];
  created_at?: string;
  updated_at?: string;
  total_items?: number;
  total_capacity?: number;
}

export interface PaginatedTrolleyItemList {
  count: number;
  next?: string;
  previous?: string;
  results: TrolleyItem[];
}

export interface PaginatedTrolleyLevelList {
  count: number;
  next?: string;
  previous?: string;
  results: TrolleyLevel[];
}

export interface PaginatedTrolleyListList {
  count: number;
  next?: string;
  previous?: string;
  results: TrolleyCreateUpdate[];
}

// ==================== QR DATA TYPES ====================

export interface QRData {
  id: number; // readOnly
  station_id: string;
  flight_number: string;
  customer_name: string;
  drawer_id: string;
  trolleys: TrolleyList[]; // readOnly
  trolley_ids: number[]; // writeOnly
  created_at: string; // readOnly
  updated_at: string; // readOnly
}

export interface PatchedQRData {
  id?: number;
  station_id?: string;
  flight_number?: string;
  customer_name?: string;
  drawer_id?: string;
  trolleys?: TrolleyList[];
  trolley_ids?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedQRDataList {
  count: number;
  next?: string;
  previous?: string;
  results: QRData[];
}

// ==================== API ERROR TYPES ====================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ==================== TROLLEY CONTENTS TYPES ====================

export interface TrolleyProduct {
  product_id: number;
  product_name: string;
  sku: string;
  category: string;
  required_quantity: number;
  price: number;
  image: string;
}

export interface TrolleyContentsByLevel {
  level_number: 1 | 2 | 3;
  level_display: string;
  products: TrolleyProduct[];
}

export interface TrolleyContentsByDrawer {
  drawer_id: string;
  drawer_level: string;
  products: TrolleyProduct[];
}

export interface TrolleySpecification {
  spec_id: string;
  spec_name: string;
  spec_description: string;
  total_items_count: number;
  total_quantity: number;
  by_level: TrolleyContentsByLevel[];
  by_drawer: TrolleyContentsByDrawer[];
}

export interface TrolleyRequiredContents {
  trolley_id: number;
  trolley_name: string;
  airline: string;
  total_specs: number;
  total_items: number;
  total_quantity: number;
  specifications: TrolleySpecification[];
}

// ==================== QR DATA V1 TYPES ====================

export interface QRDataV1 {
  id: number;
  station_id: string;
  flight_number: string;
  customer_name: string;
  drawer_id: string;
  trolley_ids: number[];
  trolleys?: Array<{
    id: number;
    name: string;
    airline: string;
    level_count: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}
