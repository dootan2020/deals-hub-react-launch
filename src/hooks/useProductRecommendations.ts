
import { useState, useEffect } from 'react';
import { Product, Recommendation, RecommendationStrategy } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type { RecommendationStrategy };

export const useProductRecommendations = (
  product: Product | null,
  strategy: RecommendationStrategy = 'similar'
) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simple recommendation logic based on category
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, images, slug')
          .eq('category_id', product.categoryId)
          .neq('id', product.id)
          .limit(4);

        if (error) {
          throw new Error(error.message);
        }

        // Transform to Recommendation type
        const recs: Recommendation[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: Number(item.price),
          image: item.images && item.images.length > 0 ? item.images[0] : '',
          slug: item.slug,
          reason: 'Similar product'
        }));

        setRecommendations(recs);
      } catch (err: any) {
        console.error('Error fetching recommendations:', err);
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [product, strategy]);

  return { recommendations, loading, error };
};
