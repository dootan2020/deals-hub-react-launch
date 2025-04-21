
import { useState, useEffect } from 'react';
import { fetchProductsWithFilters } from '@/services/productService';
import { Product, SortOption } from '@/types';

interface UseCategoryProductsProps {
  categoryId: string | null;
  sort: SortOption;
}

export const useCategoryProducts = ({ categoryId, sort }: UseCategoryProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Map our UI sort options to API sort options if they're different
        let apiSortOption: SortOption = sort;
        if (sort === 'price-high') apiSortOption = 'price-desc';
        if (sort === 'price-low') apiSortOption = 'price-asc';
        
        const result = await fetchProductsWithFilters({
          categoryId,
          sort: apiSortOption
        });
        
        if (result && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, sort]);

  return { products, loading, error };
};
