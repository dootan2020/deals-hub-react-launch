
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
}) => {
  try {
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'place-order',
        ...orderData
      }
    });

    if (error) {
      return apiError('Could not create order', error);
    }
    if (data?.success === false || data?.success === "false") {
      return apiError(data?.message || 'Could not create order', data?.error);
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return apiError('Unexpected error while creating order', error);
  }
};

// Check order status
export const checkOrderStatus = async (orderId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'check-order',
        orderId
      }
    });

    if (error) {
      return apiError('Could not check order status', error);
    }
    if (data?.success === false || data?.status === "error" || data?.success === "false") {
      return apiError(data?.message || data?.description || 'Could not check order', data?.error);
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return apiError('Unexpected error while checking order status', error);
  }
};

// Process order
export const processOrder = async (orderData: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'process-order',
        ...orderData
      }
    });

    if (error) {
      return apiError('Could not process order', error);
    }
    if (data?.success === false || data?.success === "false") {
      return apiError(data?.message || 'Could not process order', data?.error);
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return apiError('Unexpected error while processing order', error);
  }
};

// Fetch product stock
export const fetchProductStock = async (kioskToken: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'get-stock',
        kioskToken
      }
    });

    if (error) {
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
      return {
        success: false,
        message: data?.message || data?.description || 'Could not fetch stock',
        error: data?.error,
        data: null
      }
    }

    return {
      success: true,
      data
    };
  } catch (error: any) {
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
