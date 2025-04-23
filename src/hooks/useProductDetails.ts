
import { useState, useEffect } from 'react';
import { fetchProductBySlug } from '@/services/product';
import { Product } from '@/types';

export const useProductDetails = (slug: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setError('Product slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductBySlug(slug);
        setProduct(data);
        if (!data) {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  return { product, loading, error };
};

export default useProductDetails;
