/**
 * Hook para cargar y manejar los productos de un trolley desde la API
 * Usa el endpoint /trolleys/{id}/required-contents/ que devuelve la especificación del trolley
 */

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  correctSlot: number;
  quantity: number;
  placed: number;
  imageUrl: string;
  category: string;
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

interface TrolleyContentsByLevel {
  level_number: number;
  level_display: string;
  products: TrolleyProduct[];
}

interface TrolleySpecification {
  spec_id: string;
  spec_name: string;
  spec_description: string;
  total_items_count: number;
  total_quantity: number;
  by_level: TrolleyContentsByLevel[];
  by_drawer: any[];
}

interface TrolleyRequiredContents {
  trolley_id: number;
  trolley_name: string;
  airline: string;
  total_specs: number;
  total_items: number;
  total_quantity: number;
  specifications: TrolleySpecification[];
}

interface UseTrolleyProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  updateProductPlaced: (productId: string, newPlaced: number) => void;
  resetProducts: () => void;
}

export function useTrolleyProducts(
  trolleyId: number | string,
  apiUrl: string = 'http://172.191.94.124:8000/api',
): UseTrolleyProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTrolleyData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📦 Cargando productos del trolley:', trolleyId);
        console.log('🌐 Usando API URL:', apiUrl);

        // Usar el endpoint required-contents que devuelve la especificación completa
        const url = `${apiUrl}/trolleys/${trolleyId}/required-contents/`;
        console.log('🔗 URL de fetch:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        console.log('✅ Respuesta recibida:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data: TrolleyRequiredContents = await response.json();

        console.log('📊 Estructura de datos recibida:', {
          trolley_id: data.trolley_id,
          trolley_name: data.trolley_name,
          total_items: data.total_items,
          specifications: data.specifications.length,
        });

        // Extraer productos de las especificaciones por nivel
        const flattenedProducts: Product[] = [];

        data.specifications.forEach((spec) => {
          console.log(`📋 Procesando especificación: ${spec.spec_name}`);

          spec.by_level.forEach((levelData) => {
            console.log(`📦 Nivel ${levelData.level_number}: ${levelData.products.length} productos`);

            levelData.products.forEach((product) => {
              flattenedProducts.push({
                id: product.product_id.toString(),
                name: product.product_name,
                quantity: product.required_quantity,
                category: product.category,
                correctSlot: levelData.level_number,
                placed: 0,
                imageUrl: product.image,
              });
            });
          });
        });

        console.log('🎉 Productos cargados totales:', flattenedProducts.length);
        setProducts(flattenedProducts);
        setOriginalProducts(flattenedProducts);
      } catch (e: any) {
        console.error('❌ Error al cargar trolley:', e.message);
        setError(e.message || 'No se pudo conectar con la API.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrolleyData();
  }, [trolleyId, apiUrl]);

  const updateProductPlaced = (productId: string, newPlaced: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === productId ? { ...p, placed: newPlaced } : p)),
    );
  };

  const resetProducts = () => {
    setProducts(originalProducts.map((p) => ({ ...p, placed: 0 })));
  };

  return {
    products,
    loading,
    error,
    updateProductPlaced,
    resetProducts,
  };
}
