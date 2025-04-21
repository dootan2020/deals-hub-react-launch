
import { supabase } from '@/integrations/supabase/client';
import { fetchViaProxyWithFallback, ProxyConfig } from '@/utils/proxyUtils';

// Helper for consistent error objects
function apiError(message: string, error?: any) {
  return {
    success: false,
    message,
    error: error?.message || error || null
  };
}

// Create order
export const createOrder = async (orderData: {
  kioskToken: string;
  productId: string;
  quantity: number;
  promotionCode?: string;
  idempotencyKey?: string; // Added idempotency key parameter
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'place-order',
        ...orderData
      }
    });

    if (error) {
      console.error('Order creation error:', error);
      return apiError('Could not create order', error);
    }
    if (data?.success === false || data?.success === "false") {
      console.error('Order creation failed:', data?.message || 'Unknown reason', data?.error);
      return apiError(data?.message || 'Could not create order', data?.error);
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Unexpected error while creating order:', error);
    return apiError('Unexpected error while creating order', error);
  }
};

// Check order status
export const checkOrderStatus = async (orderId: string, idempotencyKey?: string) => {
  try {
    console.log(`Checking status for order: ${orderId}`);
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'check-order',
        orderId,
        idempotencyKey
      }
    });

    if (error) {
      console.error('Order status check error:', error);
      return apiError('Could not check order status', error);
    }
    if (data?.success === false || data?.status === "error" || data?.success === "false") {
      console.error('Order status check failed:', data?.message || data?.description || 'Unknown reason');
      return apiError(data?.message || data?.description || 'Could not check order', data?.error);
    }

    console.log('Order status check result:', data);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Unexpected error while checking order status:', error);
    return apiError('Unexpected error while checking order status', error);
  }
};

// Process order
export const processOrder = async (orderData: any) => {
  try {
    console.log('Processing order with data:', orderData);
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'process-order',
        ...orderData
      }
    });

    if (error) {
      console.error('Order processing error:', error);
      return apiError('Could not process order', error);
    }
    if (data?.success === false || data?.success === "false") {
      console.error('Order processing failed:', data?.message || 'Unknown reason');
      return apiError(data?.message || 'Could not process order', data?.error);
    }

    console.log('Order processing result:', data);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Unexpected error while processing order:', error);
    return apiError('Unexpected error while processing order', error);
  }
};

// Fetch product stock
export const fetchProductStock = async (kioskToken: string) => {
  try {
    console.log(`Fetching stock for kioskToken: ${kioskToken}`);
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'get-stock',
        kioskToken
      }
    });

    if (error) {
      console.error('Stock fetch error:', error);
      // Fallback to mock data
      return {
        success: false,
        message: 'Could not fetch product stock',
        error: error.message,
        data: {
          stock: 10,
          price: 100000,
          name: "Sản phẩm (Dữ liệu mô phỏng)"
        }
      }
    }
    if (data?.success === false || data?.success === "false") {
      console.error('Stock fetch failed:', data?.message || data?.description || 'Unknown reason');
      return {
        success: false,
        message: data?.message || data?.description || 'Could not fetch stock',
        error: data?.error,
        data: null
      }
    }

    console.log('Stock fetch result:', data);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('Unexpected error while fetching product stock:', error);
    // Return mock data in case of error
    return {
      success: false,
      message: 'Unexpected error while fetching product stock',
      error: error.message,
      data: {
        stock: 5,
        price: 100000,
        name: "Sản phẩm (Dữ liệu mô phỏng)"
      }
    }
  }
};
