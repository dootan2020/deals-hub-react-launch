
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
        
        // Handle product data safely
        let productValue = { title: 'Unknown Product', images: [] as string[] };
        if (data.product) {
          if (typeof data.product === 'object') {
            productValue = {
              title: data.product.title || 'Unknown Product',
              images: Array.isArray(data.product.images) ? data.product.images : []
            };
          } else if (typeof data.product === 'string') {
            productValue = {
              title: data.product,
              images: []
            };
          }
        }

        const orderWithDetails: Order = {
          ...data,
          user: userValue,
          product: productValue,
          order_items: orderItems || [],
          total_amount: data.total_price || 0
        };

        setSelectedOrder(orderWithDetails);
        return orderWithDetails;
      }
      return null;
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đơn hàng",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { selectedOrder, loading, getOrderById };
}
