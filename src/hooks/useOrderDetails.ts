
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order, normalizeUserField } from './orderUtils';

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
        .eq('id', orderId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', data.id);

        const userValue = normalizeUserField(data.user || null);
        
        // Ensure product has the required fields or provide defaults
        const productValue = data.product ? {
          title: typeof data.product === 'object' ? data.product.title || 'Unknown Product' : 'Unknown Product',
          images: typeof data.product === 'object' && Array.isArray(data.product.images) ? data.product.images : []
        } : { title: 'Unknown Product', images: [] };

        const orderWithDetails: Order = {
          ...data,
          user: userValue,
          product: productValue,
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
