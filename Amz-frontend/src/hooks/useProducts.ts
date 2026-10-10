import { useState, useEffect } from 'react';
import { Product } from '@/types';
import apiClient from '@/services/api';

interface UseProductsParams {
  categoryId?: number;
  featuredOnly?: boolean;
}

export function useProducts(params?: UseProductsParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (params?.categoryId) queryParams.append('category_id', String(params.categoryId));
        if (params?.featuredOnly) queryParams.append('is_featured', 'true');

        const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await apiClient.get(endpoint);
        const rawData = res.data;

        // Safely extract array from direct list or paginated response
        const items = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.items)
          ? rawData.items
          : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

        if (isMounted) setProducts(items);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [params?.categoryId, params?.featuredOnly]);

  return { products, loading, error };
}