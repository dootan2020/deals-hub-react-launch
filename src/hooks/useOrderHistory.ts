
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { prepareQueryParam, safeCastArray, isSafeToSpread, isSupabaseError, getSafeProperty } from '@/utils/supabaseTypeUtils';

interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number; // This field is required by the Order interface
  created_at: string;
  updated_at: string;
  product_title?: string;
}

export const useOrderHistory = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lấy đơn hàng và thông tin sản phẩm liên quan
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            product:products (
              title
            )
          )
        `)
        .eq('user_id', prepareQueryParam(userId))
        .order('created_at', { ascending: false });

      if (orderError) {
        throw orderError;
      }

      // Process and filter out any error objects
      const validOrders = safeCastArray<any>(orderData).filter(order => !isSupabaseError(order));

      // Chuyển đổi dữ liệu và thêm tiêu đề sản phẩm
      const ordersWithProductTitle = validOrders.map(order => {
        let productTitle = 'N/A';
        
        // Safely check if order_items exists and has data
        const orderItems = getSafeProperty(order, 'order_items', []);
        if (Array.isArray(orderItems) && orderItems.length > 0) {
          const firstItem = orderItems[0];
          if (firstItem && firstItem.product) {
            productTitle = getSafeProperty(firstItem.product, 'title', 'N/A');
          }
        }
        
        // Map the database fields to the Order interface
        return {
          id: getSafeProperty(order, 'id', ''),
          user_id: getSafeProperty(order, 'user_id', ''),
          external_order_id: getSafeProperty(order, 'external_order_id', null),
          status: getSafeProperty(order, 'status', ''),
          total_amount: getSafeProperty(order, 'total_price', 0), // Map total_price to total_amount
          created_at: getSafeProperty(order, 'created_at', ''),
          updated_at: getSafeProperty(order, 'updated_at', ''),
          product_title: productTitle
        } as Order;
      });

      setOrders(ordersWithProductTitle);
    } catch (err: any) {
      console.error('Error fetching order history:', err);
      setError(err.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders
  };
}
