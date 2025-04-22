
import { ApiResponse } from '@/types';

/**
 * Detects if the response is HTML
 */
export function isHtmlResponse(response: string): boolean {
  return response.includes('<html') || response.includes('<!DOCTYPE html');
}

/**
 * Extract product data from HTML response using simple string parsing
 * This is a fallback when API returns HTML instead of JSON
 */
export function extractFromHtml(htmlContent: string): ApiResponse {
  // Default response with failure status
  const result: ApiResponse = {
    success: 'false',
    error: 'Could not parse HTML response'
  };

  try {
    // Try to find product name
    const nameMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                      htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
    }

    // Try to find price
    const priceMatch = htmlContent.match(/\$\s*([\d,]+\.?\d*)/);
    if (priceMatch && priceMatch[1]) {
      result.price = priceMatch[1].replace(/,/g, '');
    }

    // Try to find description
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      result.description = descMatch[1].trim();
    }

    // If we found at least a name or price, consider it a partial success
    if (result.name || result.price) {
      result.success = 'partial';
      delete result.error;
    }

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }

  return result;
}

/**
 * Normalizes product information from different API response formats
 */
export function normalizeProductInfo(response: any): ApiResponse {
  if (!response) {
    return { success: 'false', error: 'Empty response' };
  }

  try {
    // Handle AllOrigins specific response format
    if (typeof response === 'object' && response.contents) {
      try {
        // AllOrigins sometimes returns JSON as a string in contents
        const parsed = typeof response.contents === 'string' 
          ? JSON.parse(response.contents)
          : response.contents;
        response = parsed;
      } catch (e) {
        // If parsing fails, use the original contents
        response = response.contents;
      }
    }

    // If we have a string (possibly HTML), return error
    if (typeof response === 'string') {
      if (isHtmlResponse(response)) {
        return extractFromHtml(response);
      }
      try {
        response = JSON.parse(response);
      } catch (e) {
        return { success: 'false', error: 'Response is not valid JSON or HTML' };
      }
    }

    // Now we should have an object
    const normalized: ApiResponse = {
      success: 'true'
    };

    // Handle different API formats
    if (response.product) {
      // Format 1: { product: { name, price, etc. } }
      normalized.name = response.product.name || response.product.title;
      normalized.price = response.product.price?.toString();
      normalized.stock = response.product.stock?.toString();
      normalized.description = response.product.description;
      normalized.kioskToken = response.product.kioskToken;
    } else if (response.name || response.title) {
      // Format 2: { name, price, etc. }
      normalized.name = response.name || response.title;
      normalized.price = (response.price || response.amount)?.toString();
      normalized.stock = (response.stock || response.quantity || response.available)?.toString();
      normalized.description = response.description;
      normalized.kioskToken = response.kioskToken || response.kiosk_token;
    } else if (response.data) {
      // Format 3: { data: { ... } }
      const data = response.data;
      normalized.name = data.name || data.title;
      normalized.price = (data.price || data.amount)?.toString();
      normalized.stock = (data.stock || data.quantity || data.available)?.toString();
      normalized.description = data.description;
      normalized.kioskToken = data.kioskToken || data.kiosk_token;
    } else if (response.success === false || response.error) {
      // Format 4: Error response
      normalized.success = 'false';
      normalized.error = response.error || response.message || 'Unknown API error';
    }

    // Set success to false if we couldn't extract the essential data
    if (normalized.success === 'true' && !normalized.name && !normalized.price && !normalized.stock) {
      normalized.success = 'false';
      normalized.error = 'Could not find product data in the response';
    }

    return normalized;
  } catch (error) {
    console.error('Error normalizing product info:', error);
    return { success: 'false', error: 'Error processing API response' };
  }
}

/**
 * Fetch the active API configuration
 */
export async function fetchActiveApiConfig() {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching API config:', error);
    throw new Error('Failed to fetch active API configuration');
  }
}

/**
 * Calculate payment processing fees
 */
export function calculateFee(amount: number): number {
  const fee = amount * 0.029 + 0.30;
  return Number(fee.toFixed(2));
}

/**
 * Calculate net amount after fees
 */
export function calculateNetAmount(amount: number): number {
  const fee = calculateFee(amount);
  return Number((amount - fee).toFixed(2));
}
