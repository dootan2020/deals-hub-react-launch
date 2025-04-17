
import { fetchViaProxy } from '@/utils/proxyUtils';
import { supabase } from '@/integrations/supabase/client';

interface OrderApiResponse {
  success: string;
  order_id?: string;
  description?: string;
  data?: any[];
}

interface OrderItemDetail {
  product: string;
  [key: string]: any;
}

interface PlaceOrderParams {
  kioskToken: string;
  quantity: number;
  promotionCode?: string;
}

/**
 * Fetch active API configuration with tokens
 */
export async function fetchApiConfig() {
  const { data: apiConfig, error } = await supabase
    .from('api_configs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching API config:', error);
    throw new Error('Failed to fetch API configuration');
  }
  
  if (!apiConfig) {
    throw new Error('No active API configuration found');
  }
  
  return apiConfig;
}

/**
 * Place an order with the TapHoaMMO API
 */
export async function placeOrder({ kioskToken, quantity, promotionCode }: PlaceOrderParams): Promise<OrderApiResponse> {
  try {
    const apiConfig = await fetchApiConfig();
    
    let url = `https://taphoammo.net/api/buyProducts?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(apiConfig.user_token)}&quantity=${quantity}`;
    
    if (promotionCode) {
      url += `&promotion=${encodeURIComponent(promotionCode)}`;
    }
    
    const data = await fetchViaProxy(url);
    
    if (data.success !== "true") {
      console.error('Order API error:', data.description || 'Unknown error');
      throw new Error(data.description || 'Failed to place order');
    }
    
    return data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}

/**
 * Fetch order products details based on the order ID
 */
export async function fetchOrderProducts(orderId: string): Promise<OrderApiResponse> {
  try {
    const apiConfig = await fetchApiConfig();
    
    const url = `https://taphoammo.net/api/getProducts?orderId=${encodeURIComponent(orderId)}&userToken=${encodeURIComponent(apiConfig.user_token)}`;
    
    const data = await fetchViaProxy(url);
    
    return data;
  } catch (error) {
    console.error('Error fetching order products:', error);
    throw error;
  }
}

/**
 * Check and wait for order to be processed
 */
export async function waitForOrderProcessing(orderId: string, maxRetries = 5, retryDelayMs = 2500): Promise<OrderItemDetail[]> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetchOrderProducts(orderId);
      
      if (response.success === "true" && response.data) {
        return response.data;
      }
      
      // If order is still processing, wait and retry
      if (response.description === "Order in processing!") {
        console.log(`Order ${orderId} still processing, retrying... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        retries++;
        continue;
      }
      
      // Any other error
      throw new Error(response.description || 'Unknown error while processing order');
    } catch (error) {
      if (retries >= maxRetries - 1) {
        throw error;
      }
      
      console.error(`Retry ${retries + 1}/${maxRetries} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      retries++;
    }
  }
  
  throw new Error(`Order still processing after ${maxRetries} retries`);
}

/**
 * Fetch product stock information
 */
export async function fetchProductStock(kioskToken: string): Promise<any> {
  try {
    const apiConfig = await fetchApiConfig();
    
    const url = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(apiConfig.user_token)}`;
    
    const data = await fetchViaProxy(url);
    
    if (data.success !== "true") {
      console.error('Stock API error:', data.description || 'Unknown error');
      throw new Error(data.description || 'Failed to fetch stock information');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching product stock:', error);
    throw error;
  }
}
