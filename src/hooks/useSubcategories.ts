
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useSubcategories = (subcategoryId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!subcategoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', subcategoryId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map the database results to the Product type
        const productList: Product[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: Number(item.price),
          original_price: item.original_price ? Number(item.original_price) : undefined,
          images: item.images || [],
          category_id: item.category_id,
          rating: Number(item.rating) || 0,
          review_count: item.review_count || 0,
          in_stock: item.in_stock === true,
          stock_quantity: item.stock_quantity || 0,
          badges: item.badges || [],
          slug: item.slug,
          features: item.features || [],
          specifications: item.specifications || {},
          stock: item.stock || 0,
          kiosk_token: item.kiosk_token || '',
          short_description: item.short_description || '',
          createdAt: item.created_at,
          
          // Computed properties
          get originalPrice() { return this.original_price; },
          get shortDescription() { return this.short_description || this.description.substring(0, 100); },
          get categoryId() { return this.category_id; },
          get inStock() { return this.in_stock; },
          get stockQuantity() { return this.stock_quantity || 0; },
          get reviewCount() { return this.review_count || 0; },
          get salesCount() { return 0; }
        }));
        
        setProducts(productList);
        setError(null);
      } catch (err) {
        console.error('Error fetching subcategory products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [subcategoryId]);
  
  return { products, loading, error };
};
