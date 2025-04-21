
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  product_id?: string;
  qty: number;
  keys?: Json; // Updated to match the database Json type
  promotion_code?: string;
  external_order_id?: string;
  user?: { 
    email: string;
    display_name?: string;
  } | null; // Made nullable to handle error cases
  product?: {
    title: string;
    images?: string[];
  };
  order_items?: OrderItem[];
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders with user details and product details
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id(email),
          product:product_id(title, images)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithDetails = await Promise.all(
        (data || []).map(async (order) => {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          // Handle potentially missing or error user data
          const userValue = order.user && typeof order.user === 'object' && !('error' in order.user)
            ? order.user
            : { email: 'N/A' };

          // Type casting to ensure compatibility with Order interface
          return {
            ...order,
            user: userValue,
            order_items: orderItems || []
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

  const getOrderById = async (orderId: string) => {
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

        // Handle potentially missing or error user data
        const userValue = data.user && typeof data.user === 'object' && !('error' in data.user)
          ? data.user
          : { email: 'N/A' };

        // Type casting to ensure compatibility with Order interface
        const orderWithDetails = {
          ...data,
          user: userValue,
          order_items: orderItems || []
        } as Order;

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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status, updated_at: new Date().toISOString() } : order
      ));

      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Get order details first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      if (orderError) throw orderError;
      if (!orderData) throw new Error('Không tìm thấy đơn hàng');

      // Update order status to refunded
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create refund transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: orderData.user_id,
          amount: orderData.total_price,
          type: 'refund',
          status: 'completed',
          payment_method: 'system',
          transaction_id: `refund-${orderId}`
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: orderData.user_id,
          amount_param: orderData.total_price
        }
      );

      if (balanceError) throw balanceError;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'refunded', updated_at: new Date().toISOString() } : order
      ));

      toast.success("Hoàn tiền thành công", `Số tiền ${orderData.total_price.toLocaleString('vi-VN')} VNĐ đã được hoàn trả cho người dùng`);
      
      return true;
    } catch (err) {
      console.error('Error processing refund:', err);
      toast.error("Lỗi", "Không thể xử lý yêu cầu hoàn tiền");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    selectedOrder,
    fetchOrders,
    getOrderById,
    updateOrderStatus,
    processRefund
  };
}
