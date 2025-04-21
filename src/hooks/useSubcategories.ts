
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';

interface UseSubcategoriesResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  subcategories: Category[];
  featuredProducts: Product[];
}

export const useSubcategories = (categoryId: string | null): UseSubcategoriesResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        setProducts([]);
        setSubcategories([]);
        setFeaturedProducts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', categoryId);
          
        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData || []);
        
        // Fetch products
        const { data, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryId)
          .order('created_at', { ascending: false });
          
        if (productsError) throw productsError;
        
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
          
          // Required computed properties
          shortDescription: item.short_description || item.description.substring(0, 100),
          categoryId: item.category_id,
          inStock: item.in_stock === true,
          stockQuantity: item.stock_quantity || 0,
          reviewCount: item.review_count || 0,
          originalPrice: item.original_price ? Number(item.original_price) : undefined,
          salesCount: 0
        }));
        
        setProducts(productList);
        
        // Set featured products (first 4 products with highest rating)
        setFeaturedProducts(
          [...productList].sort((a, b) => b.rating - a.rating).slice(0, 4)
        );
        
        setError(null);
      } catch (err) {
        console.error('Error fetching subcategory data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);
  
  return { products, loading, error, subcategories, featuredProducts };
};
