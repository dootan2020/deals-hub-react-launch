
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  total: number;
  processing: number;
  completed: number;
}

// Define a simple type for count queries to avoid deep type inference
type CountResult = { count: number | null };

export const useOrderStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    processing: 0,
    completed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Execute queries with explicit type casting to avoid deep inference
        const totalResult = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const processingResult = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');
        
        const completedResult = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        // Use explicit type assertion to control the inference depth
        const totalCount = (totalResult as unknown as CountResult).count || 0;
        const processingCount = (processingResult as unknown as CountResult).count || 0;
        const completedCount = (completedResult as unknown as CountResult).count || 0;

        setStats({
          total: totalCount,
          processing: processingCount,
          completed: completedCount
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, isLoading, error };
};
