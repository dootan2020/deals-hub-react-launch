
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
        // Use any to avoid type inference issues with Supabase
        const totalResult: { count: number | null } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        const processingResult: { count: number | null } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');
        
        const completedResult: { count: number | null } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        setStats({
          total: totalResult.count || 0,
          processing: processingResult.count || 0,
          completed: completedResult.count || 0
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
