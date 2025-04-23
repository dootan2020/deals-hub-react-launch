
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { prepareQueryParam, getSafeProperty } from '@/utils/supabaseTypeUtils';

type RecommendationStrategy = 'similar' | 'popular' | 'related';

export const useProductRecommendations = (
  product: Product | null,
  strategy: RecommendationStrategy = 'similar',
  limit: number = 4
) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!product) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let query = supabase.from('products').select('*');
        
        if (strategy === 'similar') {
          // Find products in the same category
          const categoryId = product.category?.id || product.categoryId;
          if (categoryId) {
            query = query.eq('category_id', prepareQueryParam(categoryId));
          }
          // Exclude current product
          query = query.neq('id', prepareQueryParam(product.id));
        } else if (strategy === 'related') {
          // Use category and tags similarity
          const categoryId = product.category?.id || product.categoryId;
          if (categoryId) {
            query = query.eq('category_id', prepareQueryParam(categoryId));
          }
          // Exclude current product
          query = query.neq('id', prepareQueryParam(product.id));
        } else if (strategy === 'popular') {
          // Get most popular products by rating
          query = query.order('rating', { ascending: false });
        }
        
        // Limit results
        query = query.limit(limit);
        
        const { data, error: queryError } = await query;
        
        if (queryError) throw queryError;
        
        if (!data || !Array.isArray(data)) {
          setRecommendations([]);
          return;
        }
        
        // Map data to Product type
        const mappedProducts: Product[] = data.map((item: any) => ({
          id: getSafeProperty(item, 'id', ''),
          title: getSafeProperty(item, 'title', ''),
          slug: getSafeProperty(item, 'slug', ''),
          description: getSafeProperty(item, 'description', ''),
          shortDescription: getSafeProperty(item, 'short_description', '') || 
                           getSafeProperty(item, 'description', '').substring(0, 100) + '...',
          price: Number(getSafeProperty(item, 'price', 0)),
          originalPrice: getSafeProperty(item, 'original_price', null) ? 
                        Number(getSafeProperty(item, 'original_price', 0)) : 
                        undefined,
          images: getSafeProperty(item, 'images', []),
          categoryId: getSafeProperty(item, 'category_id', ''),
          rating: Number(getSafeProperty(item, 'rating', 0)),
          reviewCount: Number(getSafeProperty(item, 'review_count', 0)),
          inStock: getSafeProperty(item, 'in_stock', false),
          stockQuantity: getSafeProperty(item, 'stock_quantity', 0),
          badges: getSafeProperty(item, 'badges', []),
          features: getSafeProperty(item, 'features', []),
          specifications: getSafeProperty(item, 'specifications', {}),
          salesCount: Number(getSafeProperty(item, 'sales_count', 0)),
          stock: getSafeProperty(item, 'stock', 0),
          kiosk_token: getSafeProperty(item, 'kiosk_token', ''),
          createdAt: getSafeProperty(item, 'created_at', ''),
          category: null
        }));
        
        setRecommendations(mappedProducts);
      } catch (err: any) {
        console.error('Error fetching product recommendations:', err);
        setError(err.message || 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [product, strategy, limit]);

  return { recommendations, loading, error };
};
