
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, Product } from '@/types';
import { prepareQueryParam, getSafeProperty } from '@/utils/supabaseTypeUtils';

export const useSubcategories = (parentId: string) => {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!parentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', prepareQueryParam(parentId));
          
        if (categoriesError) throw categoriesError;
        
        // Map subcategories data
        const mappedSubcategories = Array.isArray(data) ? data.map((category) => ({
          id: getSafeProperty(category, 'id', ''),
          name: getSafeProperty(category, 'name', ''),
          slug: getSafeProperty(category, 'slug', ''),
          description: getSafeProperty(category, 'description', ''),
          image: getSafeProperty(category, 'image', ''),
          count: getSafeProperty(category, 'count', 0),
          parentId: getSafeProperty(category, 'parent_id', null),
          createdAt: getSafeProperty(category, 'created_at', '')
        })) : [];
        
        setSubcategories(mappedSubcategories);
        
        // Also fetch products for this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', prepareQueryParam(parentId));
          
        if (productsError) throw productsError;
        
        // Map products data
        const mappedProducts = Array.isArray(productsData) ? productsData.map((product) => ({
          id: getSafeProperty(product, 'id', ''),
          title: getSafeProperty(product, 'title', ''),
          description: getSafeProperty(product, 'description', ''),
          shortDescription: getSafeProperty(product, 'short_description', '') || 
                          getSafeProperty(product, 'description', '').substring(0, 160),
          price: Number(getSafeProperty(product, 'price', 0)),
          originalPrice: getSafeProperty(product, 'original_price', null) ? 
                        Number(getSafeProperty(product, 'original_price', 0)) : 
                        undefined,
          images: getSafeProperty(product, 'images', []),
          categoryId: getSafeProperty(product, 'category_id', ''),
          rating: Number(getSafeProperty(product, 'rating', 0)),
          reviewCount: Number(getSafeProperty(product, 'review_count', 0)),
          inStock: getSafeProperty(product, 'in_stock', false),
          stockQuantity: getSafeProperty(product, 'stock_quantity', 0),
          badges: getSafeProperty(product, 'badges', []),
          slug: getSafeProperty(product, 'slug', ''),
          features: getSafeProperty(product, 'features', []),
          specifications: getSafeProperty(product, 'specifications', {}),
          salesCount: 0,
          stock: getSafeProperty(product, 'stock', 0),
          kiosk_token: getSafeProperty(product, 'kiosk_token', ''),
          createdAt: getSafeProperty(product, 'created_at', ''),
          category: null // Initialize with null, would need another query to populate category
        })) : [];
        
        setProducts(mappedProducts);
      } catch (err: any) {
        console.error('Error fetching subcategories:', err);
        setError(err.message || 'Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubcategories();
  }, [parentId]);

  return { subcategories, products, loading, error };
};
