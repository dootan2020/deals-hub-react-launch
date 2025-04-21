
import { useState } from 'react';
import { useOrderAdminActions } from '@/hooks/useOrderAdminActions';
import { useOrders } from '@/hooks/useOrders';

export const useAdminActions = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const orderActions = useOrderAdminActions();
  const { fetchOrders } = useOrders();

  const updateOrderStatus = async (
    orderId: string, 
    userId: string, 
    newStatus: string, 
    oldStatus: string,
    metadata: any = {}
  ) => {
    setIsProcessing(true);
    try {
      await orderActions.updateOrderStatus(orderId, userId, newStatus, oldStatus, metadata);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteOrder = async (orderId: string, userId: string) => {
    setIsProcessing(true);
    try {
      await orderActions.deleteOrder(orderId, userId);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
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
      await orderActions.refundOrder(orderId, userId, amount, oldStatus);
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    updateOrderStatus,
    deleteOrder,
    refundOrder,
    fetchOrders
  };
};
