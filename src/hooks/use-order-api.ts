import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreateOrderParams {
  kioskToken?: string;
  productId: string;
  quantity: number;
  promotionCode?: string;
  priceUSD: number;
}

interface OrderResult {
  success: boolean;
  message?: string;
  orderId?: string;
  data?: any;
}

export const useOrderApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const createOrder = async (params: CreateOrderParams): Promise<OrderResult> => {
    setLoading(true);
    setError('');
    
    try {
      // For now, we're just simulating a successful order creation
      // In a real implementation, this would call a Supabase function or directly create an order
      console.log('Creating order with params:', params);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Order created successfully',
        orderId: 'mock-order-id',
        data: { 
          order_id: 'mock-order-id',
          product_id: params.productId,
          quantity: params.quantity,
          total_price: params.priceUSD * 24000, // Convert to VND
          status: 'completed'
        }
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating order';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const checkOrder = async (orderId: string): Promise<OrderResult> => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'check-order',
          orderId
        }
      });
      
      if (error) {
        console.error('Order check error:', error);
        setError(error.message || 'Error checking order');
        return { success: false, message: error.message };
      }
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Order check exception:', err);
      setError(err.message || 'Exception while checking order');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, checkOrder, loading, error };
};
