import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOrderAdminActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateOrderStatus = async (
    orderId: string,
    userId: string,
    newStatus: string,
    oldStatus: string,
    metadata: any = {}
  ) => {
    setIsProcessing(true);
    try {
      // Update the order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log the status change
      await addOrderLog(
        orderId,
        userId,
        'status_change',
        oldStatus,
        newStatus,
        metadata
      );

      toast.success('Order status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const addOrderLog = async (
    orderId: string,
    userId: string,
    action: string,
    oldStatus: string,
    newStatus: string,
    metadata: any
  ) => {
    try {
      // Include order_activities table in Database interface 
      const { error } = await supabase
        .from('order_activities')
        .insert([
          {
            order_id: orderId,
            user_id: userId,
            action: action,
            old_status: oldStatus,
            new_status: newStatus,
            metadata: metadata
          }
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging order activity:', error);
      return false;
    }
  };

  const deleteOrder = async (orderId: string, userId: string) => {
    setIsProcessing(true);
    try {
      // Get the current order status before deletion
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the order
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteError) throw deleteError;

      // Log the deletion
      await addOrderLog(
        orderId,
        userId,
        'delete',
        orderData?.status || 'unknown',
        'deleted',
        { deleted_at: new Date().toISOString() }
      );

      toast.success('Order deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const refundOrder = async (
    orderId: string,
    userId: string,
    amount: number,
    oldStatus: string
  ) => {
    setIsProcessing(true);
    try {
      // Update user balance
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        user_id_param: userId,
        amount_param: amount
      });

      if (balanceError) throw balanceError;

      // Update order status to refunded
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'refunded', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log the refund
      await addOrderLog(
        orderId,
        userId,
        'refund',
        oldStatus,
        'refunded',
        { 
          refund_amount: amount,
          refunded_at: new Date().toISOString()
        }
      );

      toast.success(`Order refunded successfully. Amount: $${amount.toFixed(2)}`);
      return true;
    } catch (error) {
      console.error('Error refunding order:', error);
      toast.error('Failed to process refund');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    updateOrderStatus,
    deleteOrder,
    refundOrder
  };
};

export default useOrderAdminActions;
