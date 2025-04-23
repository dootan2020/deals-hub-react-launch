
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Recommendation } from '@/types';

export const usePersonalizedRecommendations = (limit = 4) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Simplified logic - just fetch some products
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, images, slug')
          .limit(limit);

        if (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
          return;
        }

        // Create a single recommendation with the fetched products
        const mappedItems = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: Number(item.price),
          images: item.images,
          slug: item.slug,
          description: '',
          stock: 0,
          categoryId: '',
          createdAt: '',
          updatedAt: '',
          category: ''
        }));

        // Create a recommendation object
        const personalizedRec: Recommendation = {
          id: 'personal-rec',
          title: 'Recommended for you',
          description: 'Products we think you might like',
          products: mappedItems
        };
        
        setRecommendations([personalizedRec]);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, limit]);

  return {
    recommendations,
    loading
  };
};

export default usePersonalizedRecommendations;
