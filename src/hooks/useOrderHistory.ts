
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOrderHistory = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            product_id,
            qty,
            total_price,
            status,
            keys,
            product:products(title)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, isLoading, error };
};
