
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from "@/hooks/use-toast";

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
          .eq('slug', productSlug)
          .maybeSingle();
        
        if (productError) throw productError;
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        const specifications: Record<string, string> = {};
        if (productData.specifications && typeof productData.specifications === 'object') {
          Object.entries(productData.specifications).forEach(([key, value]) => {
            specifications[key] = String(value);
          });
        }
        
        const mappedProduct: Product = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          shortDescription: productData.short_description || '',
          price: Number(productData.price),
          originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
          images: productData.images || [],
          categoryId: productData.category_id,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
          inStock: productData.in_stock === true,
          stockQuantity: productData.stock_quantity ?? (productData.in_stock === true ? 10 : 0),
          badges: productData.badges || [],
          slug: productData.slug,
          features: productData.features || [],
          specifications,
          salesCount: Number(0),
          stock: productData.stock || 0,
          kiosk_token: productData.kiosk_token || '',
          createdAt: productData.created_at || new Date().toISOString()
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
