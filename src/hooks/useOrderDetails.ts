
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order, normalizeUserField } from './orderUtils';
import { 
  prepareQueryParam, 
  processSupabaseData, 
  isSupabaseError, 
  isSafeToSpread,
  getSafeProperty,
  processOrderItems
} from '@/utils/supabaseTypeUtils';

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

      if (!data) {
        return null;
      }

      if (isSupabaseError(data)) {
        throw new Error('Invalid order data');
      }

      const { data: orderItemsResult } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', prepareQueryParam(getSafeProperty(data, 'id', '')));

      const userValue = normalizeUserField(getSafeProperty(data, 'user', null));
      
      // Process order items to ensure type safety
      const orderItems = processOrderItems(orderItemsResult);

      // Create order object with safe properties
      const orderWithDetails: Order = {
        id: getSafeProperty(data, 'id', ''),
        user_id: getSafeProperty(data, 'user_id', ''),
        external_order_id: getSafeProperty(data, 'external_order_id', null),
        status: getSafeProperty(data, 'status', ''),
        total_amount: getSafeProperty(data, 'total_price', 0),
        created_at: getSafeProperty(data, 'created_at', ''),
        updated_at: getSafeProperty(data, 'updated_at', ''),
        user: userValue,
        order_items: orderItems || []
      };

      setSelectedOrder(orderWithDetails);
      return orderWithDetails;
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
