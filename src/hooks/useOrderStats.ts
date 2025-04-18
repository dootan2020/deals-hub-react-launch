
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  totalOrders: number;
  processingOrders: number;
  completedOrders: number;
}

export const useOrderStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    processingOrders: 0,
    completedOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderStats = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch total orders count
        const { count: totalCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Fetch processing orders count
        const { count: processingCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'processing');

        // Fetch completed orders count
        const { count: completedCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'completed');

        setStats({
          totalOrders: totalCount || 0,
          processingOrders: processingCount || 0,
          completedOrders: completedCount || 0
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
