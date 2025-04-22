
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order, normalizeUserField } from './orderUtils';
import { useOrderAdminActions } from './useOrderAdminActions';
import { fetchOrdersWithDetails } from './useOrdersFetch';

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
      const ordersWithDetails = await fetchOrdersWithDetails();
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

// Use export type for re-exports when isolatedModules is enabled
export type { Order } from './orderUtils';
