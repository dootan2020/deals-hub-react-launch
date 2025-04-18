
import { supabase } from '@/integrations/supabase/client';
import { fetchViaProxyWithFallback, ProxyConfig } from '@/utils/proxyUtils';

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
      console.error('Create order error:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (error: any) {
    console.error('Create order exception:', error);
    return { success: false, message: "Có lỗi xảy ra: " + error.message };
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
      console.error('Check order status error:', error);
      return { status: "error", message: error.message };
    }
    
    return data;
  } catch (error: any) {
    console.error('Check order status exception:', error);
    return { status: "error", message: "Không thể kiểm tra đơn hàng: " + error.message };
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
      console.error('Process order error:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (error: any) {
    console.error('Process order exception:', error);
    return { success: false, message: "Có lỗi xảy ra: " + error.message };
  }
};

// Fetch product stock
export const fetchProductStock = async (kioskToken: string) => {
  try {
    // First try to get stock info through Supabase edge function
    const { data, error } = await supabase.functions.invoke('order-api', {
      body: {
        action: 'get-stock',
        kioskToken
      }
    });

    if (error) {
      console.error('Fetch product stock error:', error);
      // Fallback to mock data
      return { 
        success: "true", 
        stock: 10, 
        price: 100000, 
        name: "Sản phẩm (Dữ liệu mô phỏng)" 
      };
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch product stock exception:', error);
    // Return mock data in case of error
    return { 
      success: "true", 
      stock: 5, 
      price: 100000, 
      name: "Sản phẩm (Dữ liệu mô phỏng)" 
    };
  }
};
