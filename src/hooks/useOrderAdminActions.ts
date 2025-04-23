
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Order } from './orderUtils';
import { 
  prepareQueryParam, 
  prepareUpdateData, 
  prepareInsertData, 
  hasData, 
  safeErrorMessage, 
  processQueryResult,
  isSupabaseError,
  getSafeProperty
} from '@/utils/supabaseTypeUtils';

// Actions for use in admin order management views
export function useOrderAdminActions(orders: Order[], setOrders: (o: Order[]) => void) {
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update(prepareUpdateData({ 
          status, 
          updated_at: new Date().toISOString() 
        }))
        .eq('id', prepareQueryParam(orderId));

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
        .eq('id', prepareQueryParam(orderId))
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Không tìm thấy đơn hàng');

      // Check if orderData is a Supabase error
      if (isSupabaseError(orderData)) {
        throw new Error('Không thể xử lý dữ liệu đơn hàng');
      }

      // Update order status to refunded
      const { error: updateError } = await supabase
        .from('orders')
        .update(prepareUpdateData({
          status: 'refunded',
          updated_at: new Date().toISOString()
        }))
        .eq('id', prepareQueryParam(orderId));

      if (updateError) throw updateError;

      // Get safe values for refund transaction
      const userId = getSafeProperty(orderData, 'user_id', '');
      const totalPrice = getSafeProperty(orderData, 'total_price', 0);

      if (!userId) throw new Error('User ID missing from order data');
      
      // Create refund transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(prepareInsertData({
          user_id: userId,
          amount: totalPrice,
          type: 'refund',
          status: 'completed',
          payment_method: 'system',
          transaction_id: `refund-${orderId}`
        }));

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: userId,
          amount_param: totalPrice
        }
      );

      if (balanceError) throw balanceError;

      // Update orders state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'refunded', updated_at: new Date().toISOString() } : order
      ));

      toast.success("Hoàn tiền thành công", `Số tiền ${totalPrice.toLocaleString('vi-VN')} VNĐ đã được hoàn trả cho người dùng`);
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
