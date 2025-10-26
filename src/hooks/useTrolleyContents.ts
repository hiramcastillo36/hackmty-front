'use client';

import { useCallback, useState } from 'react';
import { TrolleyContentsService } from '@/services/trolley-contents.service';
import { TrolleyRequiredContents, TrolleyProduct } from '@/types/api';

export interface UseTrolleyContentsReturn {
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

export function useTrolleyContents(): UseTrolleyContentsReturn {
  const [contents, setContents] = useState<TrolleyRequiredContents | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getTrolleyContents = useCallback(async (trolleyId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`📦 Obteniendo contenidos requeridos del trolley: ${trolleyId}`);
      const response = await TrolleyContentsService.getTrolleyContents(trolleyId);

      if (response.error) {
        console.error('Error al obtener contenidos:', response.error);
        setError(response.error);
        return;
      }

      if (response.data) {
        console.log('✅ Contenidos obtenidos:', {
          trolleyName: response.data.trolley_name,
          totalItems: response.data.total_items,
          totalQuantity: response.data.total_quantity,
          specs: response.data.total_specs,
        });
        setContents(response.data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error en getTrolleyContents:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper: Get all products for a specific level
  const getProductsByLevel = useCallback(
    (levelNumber: 1 | 2 | 3) => {
      if (!contents || !contents.specifications || contents.specifications.length === 0) {
        return [];
      }

      const products: TrolleyProduct[] = [];
      contents.specifications.forEach((spec) => {
        const level = spec.by_level.find((l) => l.level_number === levelNumber);
        if (level) {
          products.push(...level.products);
        }
      });

      return products;
    },
    [contents],
  );

  // Helper: Get all products for a specific drawer
  const getProductsByDrawer = useCallback(
    (drawerId: string) => {
      if (!contents || !contents.specifications || contents.specifications.length === 0) {
        return [];
      }

      const products: TrolleyProduct[] = [];
      contents.specifications.forEach((spec) => {
        const drawer = spec.by_drawer.find((d) => d.drawer_id === drawerId);
        if (drawer) {
          products.push(...drawer.products);
        }
      });

      return products;
    },
    [contents],
  );

  // Helper: Get total items in trolley
  const getTotalItemsInTrolley = useCallback(() => {
    return contents?.total_items || 0;
  }, [contents]);

  // Helper: Get total quantity in trolley
  const getTotalQuantityInTrolley = useCallback(() => {
    return contents?.total_quantity || 0;
  }, [contents]);

  return {
    contents,
    isLoading,
    error,
    getTrolleyContents,
    getProductsByLevel,
    getProductsByDrawer,
    getTotalItemsInTrolley,
    getTotalQuantityInTrolley,
    clearError,
  };
}
