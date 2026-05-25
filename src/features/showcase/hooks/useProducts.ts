/**
 * Hook to fetch products from the dummyjson API.
 * Returns products, loading state, error state, retry function, and categories.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

const PRODUCTS_URL = 'https://dummyjson.com/products';

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

interface UseProductsResult {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
async function fetchProductsFromApi(): Promise<Product[]> {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
  const json = await response.json();
  if (!Array.isArray(json.products)) return [];
  return json.products;
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

function getErrorMessage(fetchError: unknown): string {
  if (fetchError instanceof Error) return fetchError.message;
  return 'Failed to fetch products';
}

function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchProductsFromApi();
      setProducts(result);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return Array.from(unique).sort();
  }, [products]);

  function handleRetry(): void {
    fetchProducts().catch(() => {});
  }

  return { products, categories, isLoading, error, retry: handleRetry };
}

export { useProducts };
export type { Product, UseProductsResult };
