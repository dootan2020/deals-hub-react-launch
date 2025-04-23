
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order, normalizeUserField } from './orderUtils';
import { prepareQueryParam, processSupabaseData } from '@/utils/supabaseTypeUtils';

// Standalone hook for fetching one order by ID & setting selectedOrder
export function useOrderDetails() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id(email),
          product:product_id(title, images)
        `)
        .eq('id', prepareQueryParam(orderId))
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', prepareQueryParam(data.id));

        const userValue = normalizeUserField(data.user || null);

        const orderWithDetails: Order = {
          ...data,
          user: userValue,
          order_items: orderItems || []
        };

        setSelectedOrder(orderWithDetails);
        return orderWithDetails;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error("Lỗi", "Không thể tải thông tin đơn hàng");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { selectedOrder, loading, getOrderById };
}
