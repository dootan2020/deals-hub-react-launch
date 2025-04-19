
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  total: number;
  processing: number;
  completed: number;
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
        // Use 'as any' to prevent deep type inference that causes TS2589
        const totalResult = await (supabase as any)
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const processingResult = await (supabase as any)
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');
        
        const completedResult = await (supabase as any)
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        const totalCount = totalResult?.count ?? 0;
        const processingCount = processingResult?.count ?? 0;
        const completedCount = completedResult?.count ?? 0;

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
