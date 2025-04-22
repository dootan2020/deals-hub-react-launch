
import { supabase } from '@/integrations/supabase/client';
import { fetchViaProxy, ProxyConfig } from './proxyUtils';
import { castData } from './supabaseHelpers';

export interface ApiConfig {
  user_token: string;
  kiosk_token?: string;
  name?: string;
  is_active?: boolean;
}

/**
 * Fetch the active API configuration from the database
 * @returns The active API configuration
 */
export async function fetchActiveApiConfig(): Promise<ApiConfig> {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return castData<ApiConfig>(data, { user_token: '' });
  } catch (error) {
    console.error('Error fetching API config:', error);
    throw new Error('Failed to fetch API configuration');
  }
}

/**
 * Check if the response is HTML instead of expected JSON
 * @param response The response text to check
 * @returns Boolean indicating if the response is HTML
 */
export function isHtmlResponse(response: string): boolean {
  const htmlPattern = /<(!DOCTYPE|html|body|head|div|script)/i;
  return htmlPattern.test(response);
}

/**
 * Extract product information from HTML response
 * @param html The HTML response
 * @returns Extracted product information
 */
export function extractFromHtml(html: string): any {
  try {
    // Simple regex extraction of JSON data from script tags
    const jsonDataMatch = html.match(/var\s+productData\s*=\s*(\{[^;]*\});/);
    if (jsonDataMatch && jsonDataMatch[1]) {
      return JSON.parse(jsonDataMatch[1]);
    }
    
    // Fallback to look for other JSON data patterns
    const altDataMatch = html.match(/product\s*:\s*(\{[^;]*\})/);
    if (altDataMatch && altDataMatch[1]) {
      return JSON.parse(altDataMatch[1]);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting data from HTML:', error);
    return null;
  }
}

/**
 * Normalize and standardize product information
 * @param data The raw product data
 * @returns Normalized product information
 */
export function normalizeProductInfo(data: any): any {
  if (!data) return null;
  
  return {
    name: data.name || data.title || data.productName || '',
    price: data.price || data.productPrice || '0',
    description: data.description || data.productDescription || '',
    stock: data.stock || data.inventory || data.qty || '0',
    // Add any other fields that need normalization
  };
}

/**
 * Fetch product information via serverless function
 * @param kioskToken The kiosk token for the product
 * @returns The product information
 */
export async function fetchProductInfoViaServerless(kioskToken: string): Promise<any> {
  try {
    // Get the user token from API config
    const apiConfig = await fetchActiveApiConfig();
    const userToken = apiConfig.user_token;
    
    // Call the serverless function
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: { 
        endpoint: 'getStock',
        kioskToken,
        userToken
      }
    });
    
    if (error) {
      throw new Error(`Serverless function error: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching product info via serverless:', error);
    throw error;
  }
}

/**
 * Fetch product information via direct API call
 * @param kioskToken The kiosk token for the product
 * @param proxyConfig The proxy configuration to use
 * @returns The product information
 */
export async function fetchProductInfo(kioskToken: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    const apiConfig = await fetchActiveApiConfig();
    const userToken = apiConfig.user_token;
    
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${userToken}`;
    
    const data = await fetchViaProxy(apiUrl, proxyConfig);
    return data;
  } catch (error) {
    console.error('Error fetching product info:', error);
    throw error;
  }
}
