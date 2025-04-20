
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createInvoiceFromOrder } from '@/components/account/invoice-utils';

interface OrderProduct {
  title: string;
}

interface OrderItem {
  product_id: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  product_title?: string;
}

export const useOrderHistory = (userId: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, created_at, status, total_price')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;

        const ordersWithProducts = await Promise.all((orderData || []).map(async (order) => {
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('product_id')
            .eq('order_id', order.id)
            .single();

          if (orderItem) {
            const { data: product } = await supabase
              .from('products')
              .select('title')
              .eq('id', orderItem.product_id)
              .single();

            // Nếu đơn hàng đã hoàn tất, tạo hóa đơn
            if (order.status === 'completed') {
              try {
                const orderWithProduct = {
                  ...order,
                  product_title: product?.title,
                  qty: 1 // Mặc định là 1 nếu không có thông tin
                };
                
                // Tạo hóa đơn từ đơn hàng
                await createInvoiceFromOrder(userId, order.id, orderWithProduct);
              } catch (invoiceError) {
                console.error("Error creating invoice for order:", invoiceError);
              }
            }

            return {
              ...order,
              total_amount: order.total_price, // Map total_price to total_amount
              product_title: product?.title
            };
          }

          return {
            ...order,
            total_amount: order.total_price // Map total_price to total_amount
          };
        }));

        setOrders(ordersWithProducts as Order[]);
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
