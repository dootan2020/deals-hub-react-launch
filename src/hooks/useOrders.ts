
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order, normalizeUserField } from './orderUtils';
import { useOrderAdminActions } from './useOrderAdminActions';

// Core hook for order list and basic updating
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const adminActions = useOrderAdminActions(orders, setOrders);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders with user and product details
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id(email),
          product:product_id(title, images)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithDetails = await Promise.all(
        (data || []).map(async (order: any) => {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          // handle nulls for user
          const userValue = normalizeUserField(order.user || null);
          return {
            ...order,
            user: userValue,
            order_items: orderItems || [],
          } as Order;
        })
      );

      setOrders(ordersWithDetails);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng');
      toast.error("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    setOrders,
    fetchOrders,
    ...adminActions
  };
}

export { Order } from './orderUtils';
