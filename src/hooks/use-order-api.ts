
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

export function useOrderApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (params: CreateOrderParams): Promise<OrderResult> => {
    setLoading(true);
    setError(null);
    
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

  return {
    createOrder,
    loading,
    error
  };
}
