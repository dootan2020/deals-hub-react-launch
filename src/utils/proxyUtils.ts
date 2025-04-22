
// Define the ProxyConfig type that appears to be missing
export interface ProxyConfig {
  proxy_type: string;
  custom_url?: string;
  id?: string;
}

/**
 * Builds a proxy URL based on the provided configuration
 * @param url The original URL to proxy
 * @param config The proxy configuration
 * @returns The proxied URL
 */
export function buildProxyUrl(url: string, config: ProxyConfig): string {
  if (!config) {
    // Default to a public CORS proxy if no config is provided
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }

  switch (config.proxy_type) {
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
    case 'custom':
      if (config.custom_url) {
        return `${config.custom_url.replace(/\/$/, '')}/${url.replace(/^https?:\/\//, '')}`;
      }
      return url;
    default:
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
}

/**
 * Fetches data via a proxy based on the provided configuration
 * @param url The original URL to fetch
 * @param config The proxy configuration
 * @returns The fetched data
 */
export async function fetchViaProxy(url: string, config?: ProxyConfig): Promise<any> {
  try {
    const proxiedUrl = buildProxyUrl(url, config || { proxy_type: 'allorigins' });
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}

/**
 * Determines if a response is HTML based on its content
 * @param response The response to check
 * @returns Boolean indicating if the response is HTML
 */
export function isHtmlResponse(response: string): boolean {
  const htmlPattern = /<(!DOCTYPE|html|head|body|div|script)/i;
  return htmlPattern.test(response.trim());
}

/**
 * Fetches via proxy with fallback mechanisms if the primary proxy fails
 * @param url The URL to fetch
 * @param primaryConfig The primary proxy configuration
 * @param fallbackConfigs Optional fallback proxy configurations
 * @returns The fetched data
 */
export async function fetchViaProxyWithFallback(
  url: string, 
  primaryConfig: ProxyConfig,
  fallbackConfigs: ProxyConfig[] = []
): Promise<any> {
  try {
    return await fetchViaProxy(url, primaryConfig);
  } catch (primaryError) {
    console.error('Primary proxy failed:', primaryError);
    
    // Try fallback proxies
    for (const fallbackConfig of fallbackConfigs) {
      try {
        return await fetchViaProxy(url, fallbackConfig);
      } catch (fallbackError) {
        console.error(`Fallback proxy ${fallbackConfig.proxy_type} failed:`, fallbackError);
      }
    }
    
    // All proxies failed
    throw new Error('All proxy attempts failed');
  }
}

/**
 * Extracts content from HTML response
 * @param htmlContent The HTML content to parse
 * @param selector The CSS selector to use for extraction
 * @returns The extracted content
 */
export function extractFromHtml(htmlContent: string, selector: string): string | null {
  try {
    // Basic HTML parsing - in a real app, use a proper HTML parser
    const match = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i').exec(htmlContent);
    return match ? match[1].trim() : null;
  } catch (error) {
    console.error('Error extracting from HTML:', error);
    return null;
  }
}

/**
 * Normalizes product information from various sources
 * @param data The raw product data
 * @returns Normalized product information
 */
export function normalizeProductInfo(data: any): any {
  if (!data) return null;
  
  // Basic normalization - customize based on your actual data structure
  return {
    name: data.name || data.title || data.productName,
    description: data.description || data.desc || data.productDescription,
    price: data.price || data.productPrice || '0',
    stock: data.stock || data.quantity || data.inventory || '0',
    kioskToken: data.kioskToken || data.token
  };
}

/**
 * Fetches proxy settings from Supabase
 * @returns The proxy configuration
 */
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .single();
      
    if (error) throw error;
    
    return data as ProxyConfig;
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    // Return default settings if fetch fails
    return { proxy_type: 'allorigins' };
  }
}
