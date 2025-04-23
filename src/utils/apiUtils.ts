
import { fetchViaProxy, ProxyConfig } from './proxyUtils';

// Define the ApiResponse type for consistent use across the application
export interface ApiResponse {
  success: string;
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
  kioskToken?: string;
  error?: string;
}

// Function to fetch API configurations from Supabase
export async function fetchActiveApiConfig() {
  try {
    const response = await fetch('/api/api-config');
    if (!response.ok) {
      throw new Error(`API config fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data || { user_token: '', kiosk_token: '' };
  } catch (error) {
    console.error('Error fetching API config:', error);
    return { user_token: '', kiosk_token: '' };
  }
}

// Function to fetch product data via proxy using API tokens
export async function fetchProductData(kioskToken: string, userToken: string, proxyConfig: ProxyConfig): Promise<ApiResponse> {
  try {
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${userToken}`;
    const data = await fetchViaProxy(apiUrl, proxyConfig);
    
    if (data?.success === "true") {
      return {
        success: "true",
        name: data.name || '',
        price: data.price || '0',
        stock: data.stock || '0',
        description: data.description || '',
        kioskToken: kioskToken
      };
    } else {
      return {
        success: "false",
        error: data?.error || 'Unknown error fetching product data',
      };
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {
      success: "false",
      error: `API error: ${(error as Error).message}`,
    };
  }
}

// Export the fetchViaProxy function from proxyUtils for direct usage
export { fetchViaProxy };
