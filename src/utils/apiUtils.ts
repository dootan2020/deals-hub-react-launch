
import { ProxyConfig, buildProxyUrl } from './proxyUtils';

export interface ApiResponse {
  success: string;
  kioskToken?: string;
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
  error?: string;
}

export interface ApiConfig {
  user_token: string;
  kiosk_token?: string;
  name?: string;
  id?: string;
  is_active?: boolean;
}

/**
 * Helper function to fetch active API configuration
 */
export async function fetchActiveApiConfig(): Promise<ApiConfig> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching API config:', error);
      return { user_token: '' };
    }

    return data as ApiConfig || { user_token: '' };
  } catch (error) {
    console.error('Error in fetchActiveApiConfig:', error);
    return { user_token: '' };
  }
}

/**
 * Fetch product data using a kiosk token
 */
export async function fetchProductData(
  kioskToken: string,
  userToken: string,
  proxyConfig?: ProxyConfig
): Promise<ApiResponse> {
  try {
    if (!kioskToken || !userToken) {
      return { 
        success: 'false', 
        error: 'Missing kiosk token or user token' 
      };
    }

    // Call the serverless function
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: { 
        endpoint: 'getStock',
        kioskToken,
        userToken
      }
    });
    
    if (error) {
      return {
        success: 'false',
        error: `Serverless function error: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        success: 'false',
        error: 'Empty response from API'
      };
    }
    
    // Add the kioskToken to the response for reference
    return {
      ...data,
      kioskToken
    };
  } catch (error) {
    return {
      success: 'false',
      error: `Error: ${(error as Error).message}`
    };
  }
}
