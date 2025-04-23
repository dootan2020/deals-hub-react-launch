
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderHistoryItem {
  id: string;
  product_title: string;
  quantity: number;
  total_price: number;
  created_at: string;
  status: string;
  keys: string[];
}

export const useOrderHistory = (userId: string | undefined) => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              title
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedOrders = data.map((order) => ({
          id: order.id,
          product_title: order.products?.title || 'N/A',
          quantity: order.qty,
          total_price: order.total_price,
          created_at: order.created_at,
          status: order.status,
          keys: order.keys || []
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải lịch sử đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { orders, isLoading, error };
};
