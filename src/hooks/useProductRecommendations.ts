
import { useState, useEffect } from 'react';
import { Product } from '@/types';

// Re-export the type
export type RecommendationStrategy = 'similar' | 'popular' | 'trending' | 'local' | 'openai' | 'claude';

// Define and export Recommendation type
export interface Recommendation {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  score?: number;
  reason?: string;
}

export const useProductRecommendations = (
  product: Product | null,
  strategy: RecommendationStrategy = 'similar'
) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple implementation returning empty array
    setRecommendations([]);
    setLoading(false);
  }, [product, strategy]);

  return { recommendations, loading, error };
};
