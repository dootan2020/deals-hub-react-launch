
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from "@/hooks/use-toast";
import { 
  prepareQueryParam, 
  getSafeProperty,
  isSupabaseError
} from '@/utils/supabaseTypeUtils';

export const useProduct = (productSlug: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories:category_id(*)')
          .eq('slug', prepareQueryParam(productSlug))
          .maybeSingle();
        
        if (productError) throw productError;
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        // Check if result is an error
        if (isSupabaseError(productData)) {
          throw new Error('Invalid product data');
        }
        
        // Safely extract specifications
        const specifications: Record<string, string> = {};
        const productSpecs = getSafeProperty(productData, 'specifications', {});
        if (productSpecs && typeof productSpecs === 'object') {
          Object.entries(productSpecs).forEach(([key, value]) => {
            specifications[key] = String(value);
          });
        }
        
        const mappedProduct: Product = {
          id: getSafeProperty(productData, 'id', ''),
          title: getSafeProperty(productData, 'title', ''),
          description: getSafeProperty(productData, 'description', ''),
          shortDescription: getSafeProperty(productData, 'short_description', '') || 
                          getSafeProperty(productData, 'description', '').substring(0, 160),
          price: Number(getSafeProperty(productData, 'price', 0)),
          originalPrice: getSafeProperty(productData, 'original_price', null) ? 
                        Number(getSafeProperty(productData, 'original_price', 0)) : 
                        undefined,
          images: getSafeProperty(productData, 'images', []),
          categoryId: getSafeProperty(productData, 'category_id', ''),
          rating: Number(getSafeProperty(productData, 'rating', 0)),
          reviewCount: Number(getSafeProperty(productData, 'review_count', 0)),
          inStock: getSafeProperty(productData, 'in_stock', false) === true,
          stockQuantity: getSafeProperty(productData, 'stock_quantity', 0) ?? 
                        (getSafeProperty(productData, 'in_stock', false) === true ? 10 : 0),
          badges: getSafeProperty(productData, 'badges', []),
          slug: getSafeProperty(productData, 'slug', ''),
          features: getSafeProperty(productData, 'features', []),
          specifications,
          salesCount: 0,
          stock: getSafeProperty(productData, 'stock', 0),
          kiosk_token: getSafeProperty(productData, 'kiosk_token', ''),
          createdAt: getSafeProperty(productData, 'created_at', new Date().toISOString()),
          category: getSafeProperty(productData, 'categories', null)
        };
          
        setProduct(mappedProduct);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product information');
        toast.error("Error", "There was a problem loading the product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productSlug]);

  return { product, loading, error };
};
