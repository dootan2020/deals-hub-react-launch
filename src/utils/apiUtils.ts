
import { ApiResponse } from '@/types';

/**
 * Check if the response is HTML
 */
export function isHtmlResponse(response: string): boolean {
  const htmlPattern = /<(!DOCTYPE|html|head|body|div|script)/i;
  return htmlPattern.test(response.trim());
}

/**
 * Extract product information from HTML response
 */
export function extractFromHtml(html: string): ApiResponse {
  try {
    // Basic extraction attempt
    const nameMatch = html.match(/<title>(.*?)<\/title>/i);
    const priceMatch = html.match(/\$([0-9]+(\.[0-9]{1,2})?)/);
    const stockMatch = html.match(/stock:\s*([0-9]+)/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    return {
      success: nameMatch ? 'true' : 'false',
      name: nameMatch ? nameMatch[1] : '',
      price: priceMatch ? priceMatch[1] : '',
      stock: stockMatch ? stockMatch[1] : '',
      description: descMatch ? descMatch[1] : '',
    };
  } catch (e) {
    console.error("Error extracting from HTML:", e);
    return {
      success: 'false',
      error: e instanceof Error ? e.message : 'Unknown error parsing HTML'
    };
  }
}

/**
 * Normalize product info from API response
 */
export function normalizeProductInfo(response: any): ApiResponse {
  if (!response) return { success: 'false', error: 'Empty response' };
  
  if (typeof response === 'string') {
    if (isHtmlResponse(response)) {
      return extractFromHtml(response);
    }
    
    try {
      // Try to parse as JSON if it's a string but not HTML
      return normalizeProductInfo(JSON.parse(response));
    } catch (e) {
      return {
        success: 'false',
        error: 'Response is text but not parsable as JSON or HTML'
      };
    }
  }
  
  // Handle object responses
  if (typeof response === 'object') {
    const result: ApiResponse = {};
    
    // Try to find standard fields
    if ('success' in response) result.success = String(response.success);
    if ('name' in response) result.name = String(response.name);
    else if ('title' in response) result.name = String(response.title);
    
    if ('price' in response) result.price = String(response.price);
    if ('stock' in response) result.stock = String(response.stock);
    if ('description' in response) result.description = String(response.description);
    if ('kioskToken' in response) result.kioskToken = String(response.kioskToken);
    if ('error' in response) result.error = String(response.error);
    
    return result;
  }
  
  return {
    success: 'false',
    error: 'Unsupported response format'
  };
}
