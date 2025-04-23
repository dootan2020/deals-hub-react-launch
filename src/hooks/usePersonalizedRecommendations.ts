
import { useState, useEffect } from 'react';
import { Product, Recommendation, RecommendationStrategy } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const usePersonalizedRecommendations = (
  userId: string | null,
  product: Product | null,
  strategy: RecommendationStrategy = 'popular'
) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product || !userId) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simple personalized recommendation logic (popular products)
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, images, slug')
          .order('sales_count', { ascending: false })
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
          reason: 'Popular choice'
        }));

        setRecommendations(recs);
      } catch (err: any) {
        console.error('Error fetching personalized recommendations:', err);
        setError(err.message || 'Failed to fetch personalized recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [product, userId, strategy]);

  return { recommendations, loading, error };
};
