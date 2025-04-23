
import { useState, useEffect } from 'react';
import { fetchProductBySlug } from '@/services/product';
import { Product } from '@/types';

export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductBySlug(slug);
        setProduct(data);
        if (!data) {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error loading product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  return { product, loading, error };
};
