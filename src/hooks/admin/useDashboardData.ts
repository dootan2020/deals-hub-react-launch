import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { castData, castArrayData } from '@/utils/supabaseHelpers';
import type { Order, OrderItem } from '@/types';

export const useDashboardData = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await fetchOrders();
        const fetchedOrderItems = await fetchOrderItems();

        setOrders(fetchedOrders);
        setOrderItems(fetchedOrderItems);
      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return castArrayData<Order>(data);
  };

  const fetchOrderItems = async () => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }

    return castArrayData<OrderItem>(data);
  };

  return {
    orders,
    orderItems,
    loading,
    error,
  };
};
