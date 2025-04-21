import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order } from './orderUtils';

// Actions for use in admin order management views
export function useOrderAdminActions(orders: Order[], setOrders: (o: Order[]) => void) {
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

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

  // Refund logic
  const processRefund = async (orderId: string) => {
    try {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Không tìm thấy đơn hàng');

      // Update order
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Transaction
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

      // Balance
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: orderData.user_id,
          amount_param: orderData.total_price
        }
      );

      if (balanceError) throw balanceError;

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

  return { loading, updateOrderStatus, processRefund };
}
