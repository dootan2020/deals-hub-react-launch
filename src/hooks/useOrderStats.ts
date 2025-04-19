
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  total: number;
  processing: number;
  completed: number;
}

interface CountQueryResult {
  count: number | null;
}

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
        // Explicitly type the query results to prevent deep type inference
        const totalResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const processingResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');
        
        const completedResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        // Extract counts with explicit typing
        const totalCount: number = totalResult.count || 0;
        const processingCount: number = processingResult.count || 0;
        const completedCount: number = completedResult.count || 0;

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
