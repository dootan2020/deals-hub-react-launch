
import { Product } from '@/types';
import { buildProxyUrl, ProxyType } from '@/utils/proxyUtils';

// Define API response type
export interface ApiProductResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
  mock?: boolean;
  error?: string;
}

/**
 * Helper function to check if a response is HTML
 */
const isHtmlResponse = (response: string): boolean => {
  return response.trim().startsWith('<!DOCTYPE html>') || 
         response.trim().startsWith('<html') || 
         response.includes('<body') || 
         response.includes('<head');
};

/**
 * Extract useful content from HTML
 */
const extractFromHtml = (html: string, selector = 'body'): string => {
  try {
    // Simple extraction
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  } catch (error) {
    return html;
  }
};

/**
 * Generate mock product data with a given token
 */
export const generateMockProduct = (token?: string): ApiProductResponse => {
  const randomStock = Math.floor(Math.random() * 100) + 1;
  const randomPrice = Math.floor(Math.random() * 1000000) + 50000;
  
  return {
    success: 'true',
    name: token ? `Product ${token.substring(0, 5)}` : 'Sample Product',
    price: randomPrice.toString(),
    stock: randomStock.toString(),
    description: 'This is a mock product description generated because the API returned HTML or had CORS issues.',
    mock: true
  };
};

/**
 * Fetch product data from API with proxy
 */
export const fetchProductData = async (
  kioskToken: string, 
  userToken: string, 
  proxyConfig: { proxy_type: ProxyType, type?: ProxyType }
): Promise<ApiProductResponse> => {
  try {
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}`;
    
    // Build proxy URL
    const { url: proxyUrl, isProxied } = buildProxyUrl(apiUrl, {
      proxy_type: proxyConfig.proxy_type,
      type: proxyConfig.type
    });
    
    // Fetch with proxy
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`API returned error: ${response.status}`);
    }
    
    const responseText = await response.text();
    
    // Handle HTML responses from proxy
    if (isProxied && isHtmlResponse(responseText)) {
      console.warn('API returned HTML instead of JSON. Using mock data.');
      return generateMockProduct(kioskToken);
    }
    
    // Handle AllOrigins format
    if (proxyConfig.type === 'allorigins' && responseText.includes('"contents"')) {
      try {
        const allOriginsData = JSON.parse(responseText);
        if (allOriginsData && allOriginsData.contents) {
          // Parse the contents which should be our actual API response
          return JSON.parse(allOriginsData.contents);
        }
      } catch {
        return generateMockProduct(kioskToken);
      }
    }
    
    // Try to parse as JSON directly
    try {
      return JSON.parse(responseText);
    } catch {
      console.warn('Failed to parse API response as JSON. Using mock data.');
      return generateMockProduct(kioskToken);
    }
    
  } catch (error) {
    console.error('Error fetching product data:', error);
    return generateMockProduct(kioskToken);
  }
};
