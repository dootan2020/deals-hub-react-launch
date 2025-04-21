
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
          short_description: productData.short_description || '',
          price: Number(productData.price),
          original_price: productData.original_price ? Number(productData.original_price) : undefined,
          images: productData.images || [],
          category_id: productData.category_id,
          rating: productData.rating || 0,
          review_count: productData.review_count || 0,
          in_stock: productData.in_stock === true,
          stock_quantity: productData.stock_quantity ?? (productData.in_stock === true ? 10 : 0),
          badges: productData.badges || [],
          slug: productData.slug,
          features: productData.features || [],
          specifications,
          stock: productData.stock || 0,
          kiosk_token: productData.kiosk_token || '',
          createdAt: productData.created_at || new Date().toISOString(),
          
          // Add getters for API compatibility
          get originalPrice() { return this.original_price; },
          get shortDescription() { return this.short_description || this.description.substring(0, 100); },
          get categoryId() { return this.category_id; },
          get inStock() { return this.in_stock; },
          get stockQuantity() { return this.stock_quantity || this.stock || 0; },
          get reviewCount() { return this.review_count; },
          get salesCount() { return 0; },
          get category() { return productData.categories; }
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
