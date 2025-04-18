
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useOrderApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  const createOrder = async (orderData: {
    kioskToken: string;
    productId: string;
    quantity: number;
    promotionCode?: string;
  }) => {
    setIsLoading(true);
    setOrderStatus('loading');
    setOrderError(null);
    
    try {
      console.log('Creating order with data:', orderData);
      
      // Prepare the payload for the API call
      const payload = {
        action: 'place-order',
        kioskToken: orderData.kioskToken,
        productId: orderData.productId,
        quantity: orderData.quantity,
      };
      
      // Add promotion code if provided
      if (orderData.promotionCode) {
        payload['promotionCode'] = orderData.promotionCode;
      }
      
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: payload
      });

      if (error) {
        console.error('Order API error:', error);
        setOrderError(error.message || 'Không thể tạo đơn hàng');
        setOrderStatus('error');
        return { success: false, message: error.message || 'Không thể tạo đơn hàng' };
      }
      
      console.log('Order API response:', data);
      setOrderResult(data);
      
      if (data?.order_id) {
        setOrderStatus('success');
        return { 
          success: true, 
          orderId: data.order_id,
          message: 'Đơn hàng đã được tạo thành công' 
        };
      } else {
        setOrderStatus('error');
        setOrderError(data?.message || 'Không thể tạo đơn hàng');
        return { 
          success: false, 
          message: data?.message || 'Không thể tạo đơn hàng' 
        };
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setOrderError(err.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      setOrderStatus('error');
      return { success: false, message: err.message || 'Có lỗi xảy ra khi tạo đơn hàng' };
    } finally {
      setIsLoading(false);
    }
  };

  const checkOrder = async ({ orderId }: { orderId: string }) => {
    setIsLoading(true);
    setOrderStatus('loading');
    setOrderError(null);
    
    try {
      console.log('Checking order status for:', orderId);
      
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'check-order',
          orderId
        }
      });

      if (error) {
        console.error('Order check error:', error);
        setOrderError(error.message || 'Không thể kiểm tra đơn hàng');
        setOrderStatus('error');
        return { success: false, message: error.message || 'Không thể kiểm tra đơn hàng' };
      }
      
      console.log('Order check response:', data);
      setOrderResult(data);
      
      if (data?.success === 'true') {
        setOrderStatus('success');
      } else if (data?.description === 'Order in processing!') {
        // This is not an error, just processing
        setOrderStatus('loading');
      } else {
        setOrderStatus('error');
        setOrderError(data?.description || 'Không thể tải thông tin đơn hàng');
      }
      
      return data;
    } catch (err: any) {
      console.error('Order check failed:', err);
      setOrderError(err.message || 'Có lỗi xảy ra khi kiểm tra đơn hàng');
      setOrderStatus('error');
      return { success: false, message: err.message || 'Có lỗi xảy ra khi kiểm tra đơn hàng' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createOrder,
    checkOrder,
    orderStatus,
    orderError,
    orderResult,
  };
};
