
import { ApiResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a response appears to be HTML
 */
export function isHtmlResponse(text: string): boolean {
  return /<\s*html[\s>]/i.test(text) || /<\s*body[\s>]/i.test(text);
}

/**
 * Extract product information from HTML content
 */
export function extractFromHtml(htmlContent: string): ApiResponse {
  try {
    // Extract main product info using regex patterns
    const titleMatch = /<title[^>]*>(.*?)<\/title>/i.exec(htmlContent);
    const descMatch = /<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i.exec(htmlContent);
    const priceMatch = /price["\s:]+(\d+\.?\d*)/i.exec(htmlContent);
    const stockMatch = /stock["\s:]+(\d+)/i.exec(htmlContent);
    
    const result: ApiResponse = {
      success: 'true'
    };
    
    if (titleMatch && titleMatch[1]) result.name = titleMatch[1].trim();
    if (descMatch && descMatch[1]) result.description = descMatch[1].trim();
    if (priceMatch && priceMatch[1]) result.price = priceMatch[1].trim();
    if (stockMatch && stockMatch[1]) result.stock = stockMatch[1].trim();
    
    // If we couldn't extract essential info, mark as failure
    if (!result.name && !result.price) {
      return {
        success: 'false',
        error: 'Could not extract product information from HTML'
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting data from HTML:', error);
    return {
      success: 'false',
      error: 'Error parsing HTML response'
    };
  }
}

/**
 * Normalize product information from various formats
 */
export function normalizeProductInfo(data: any): ApiResponse {
  try {
    // Handle string responses
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return normalizeProductInfo(parsed);
      } catch {
        return { 
          success: 'false', 
          error: 'Invalid response format'
        };
      }
    }
    
    // Handle null or undefined
    if (!data) {
      return { 
        success: 'false', 
        error: 'Empty response'
      };
    }
    
    // Initialize result object
    const result: ApiResponse = { 
      success: 'true' 
    };
    
    // Extract data from common field names
    if (data.name || data.title || data.productName) {
      result.name = data.name || data.title || data.productName;
    }
    
    if (data.description || data.desc || data.productDescription) {
      result.description = data.description || data.desc || data.productDescription;
    }
    
    if (data.price || data.cost || data.productPrice) {
      result.price = String(data.price || data.cost || data.productPrice);
    }
    
    if (data.stock !== undefined || data.quantity !== undefined || data.inStock !== undefined) {
      result.stock = String(data.stock || data.quantity || data.inStock || 0);
    }
    
    // Extract token if available
    if (data.kioskToken || data.token) {
      result.kioskToken = data.kioskToken || data.token;
    }
    
    // Check for errors in the API response
    if (data.error || data.errorMessage || (data.success === false)) {
      result.success = 'false';
      result.error = data.error || data.errorMessage || 'Unknown error';
    }
    
    // Check if we have enough data
    if (result.success === 'true' && !result.name && !result.price) {
      result.success = 'false';
      result.error = 'Incomplete product information';
    }
    
    return result;
  } catch (error) {
    console.error('Error normalizing product info:', error);
    return { 
      success: 'false', 
      error: error instanceof Error ? error.message : 'Unknown error processing data'
    };
  }
}

/**
 * Fetch product information through serverless function
 */
export async function fetchProductInfoViaServerless(
  kioskToken: string,
  userToken: string
): Promise<ApiResponse> {
  try {
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

    return normalizeProductInfo(data);
  } catch (error) {
    console.error('Error fetching product info:', error);
    return {
      success: 'false',
      error: error instanceof Error ? error.message : 'Failed to fetch product info'
    };
  }
}
