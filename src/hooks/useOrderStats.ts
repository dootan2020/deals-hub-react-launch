
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

  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Instead of using complex type inference, use simpler query approach
        // Query 1: Get total orders
        const totalResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        // Query 2: Get processing orders
        const processingResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');
          
        // Query 3: Get completed orders
        const completedResult = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');
        
        // Get the count values, defaulting to 0 if count is null
        const totalCount = totalResult.count ?? 0;
        const processingCount = processingResult.count ?? 0;
        const completedCount = completedResult.count ?? 0;

        setStats({
          total: totalCount,
          processing: processingCount,
          completed: completedCount
        });
      } catch (error) {
        console.error('Error fetching order stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderStats();
  }, [userId]);

  return { stats, isLoading };
};
