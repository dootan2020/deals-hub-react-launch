
import { supabase } from '@/integrations/supabase/client';
import { fetchViaProxy, isHtmlResponse } from './proxyUtils';

/**
 * Fetches the active API configuration from Supabase
 * @returns The active API configuration
 */
export async function fetchActiveApiConfig(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching API configuration:', error);
    throw error;
  }
}

/**
 * Fetches product information via serverless function
 * @param kioskToken The kiosk token for the product
 * @returns The product information
 */
export async function fetchProductInfoViaServerless(kioskToken: string): Promise<any> {
  try {
    if (!kioskToken) {
      throw new Error('Kiosk token is required');
    }
    
    const apiConfig = await fetchActiveApiConfig();
    
    if (!apiConfig || !apiConfig.user_token) {
      throw new Error('API configuration not found or missing user token');
    }
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: {
        endpoint: 'getStock',
        kioskToken,
        userToken: apiConfig.user_token
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching product via serverless function:', error);
    throw error;
  }
}

/**
 * Handles potential HTML responses and converts them to usable data
 * @param response The response to process
 * @returns Processed data
 */
export function processApiResponse(response: any): any {
  if (typeof response === 'string' && isHtmlResponse(response)) {
    // Process HTML response
    const extractedData = extractDataFromHtml(response);
    return normalizeProductInfo(extractedData);
  }
  
  return response;
}

/**
 * Extracts data from HTML response
 * @param html The HTML content
 * @returns Extracted data
 */
export function extractDataFromHtml(html: string): any {
  // Implementation would depend on the specific HTML structure
  // This is just a placeholder
  return {
    name: extractValue(html, 'product-name'),
    price: extractValue(html, 'product-price'),
    stock: extractValue(html, 'product-stock'),
    description: extractValue(html, 'product-description')
  };
}

/**
 * Extracts a value from HTML based on a class name
 * @param html The HTML content
 * @param className The class name to look for
 * @returns The extracted value
 */
function extractValue(html: string, className: string): string {
  const regex = new RegExp(`class=["']${className}["'][^>]*>([^<]+)<`);
  const match = regex.exec(html);
  return match ? match[1].trim() : '';
}

export function extractFromHtml(html: string, selector: string = 'body'): any {
  try {
    // Basic extraction logic - this would need to be improved for real use
    const match = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i').exec(html);
    
    if (match && match[1]) {
      const content = match[1].trim();
      
      // Try to extract structured data
      const nameMatch = /<[^>]*class=["']product-name["'][^>]*>([^<]+)</.exec(content);
      const priceMatch = /<[^>]*class=["']product-price["'][^>]*>([^<]+)</.exec(content);
      const stockMatch = /<[^>]*class=["']product-stock["'][^>]*>([^<]+)</.exec(content);
      const descMatch = /<[^>]*class=["']product-description["'][^>]*>([^<]+)</.exec(content);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Product',
        price: priceMatch ? priceMatch[1].trim() : '0',
        stock: stockMatch ? stockMatch[1].trim() : '0',
        description: descMatch ? descMatch[1].trim() : '',
        success: 'true' // Indicate successful extraction
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
}

export function normalizeProductInfo(data: any): any {
  if (!data) return {
    name: 'Unknown Product',
    description: 'No description available',
    price: '0',
    stock: '0',
    success: 'false'
  };
  
  return {
    name: data.name || data.title || data.productName || 'Unknown Product',
    description: data.description || data.desc || data.productDescription || '',
    price: data.price || data.productPrice || '0',
    stock: data.stock || data.quantity || data.inventory || '0',
    kioskToken: data.kioskToken || data.token || '',
    success: data.success || 'true'
  };
}

export { isHtmlResponse };  // Re-export from proxyUtils for backwards compatibility
