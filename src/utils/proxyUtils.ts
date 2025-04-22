
// Base URLs for different proxy types
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxyConfig {
  proxy_type: ProxyType;
  custom_url?: string;
}

const PROXY_URLS = {
  'allorigins': 'https://api.allorigins.win/raw?url=',
  'corsproxy': 'https://corsproxy.io/?',
  'cors-anywhere': 'https://cors-anywhere.herokuapp.com/',
  'direct': '',
  'custom': ''
};

export interface ProxyResponse {
  url: string;
  proxyType: ProxyType;
}

/**
 * Build proxied URL based on proxy config
 */
export function buildProxyUrl(targetUrl: string, config: ProxyConfig): ProxyResponse {
  const { proxy_type, custom_url } = config;
  
  let url: string;
  if (proxy_type === 'custom' && custom_url) {
    url = custom_url.includes('{url}') 
      ? custom_url.replace('{url}', encodeURIComponent(targetUrl))
      : `${custom_url}${encodeURIComponent(targetUrl)}`;
  } else {
    url = `${PROXY_URLS[proxy_type]}${encodeURIComponent(targetUrl)}`;
  }
  
  return {
    url,
    proxyType: proxy_type
  };
}

/**
 * Fetch with fallback to different proxy types
 */
export async function fetchViaProxyWithFallback<T>(
  url: string,
  initialConfig?: ProxyConfig
): Promise<T> {
  // Default to allorigins if no config provided
  const config = initialConfig || { proxy_type: 'allorigins' };
  
  // Order of fallback proxies
  const fallbackOrder: ProxyType[] = ['allorigins', 'corsproxy', 'cors-anywhere', 'direct'];
  
  let lastError: Error;
  
  // Try with initial config
  try {
    const proxyUrl = buildProxyUrl(url, config).url;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    return await response.text() as T;
  } catch (error) {
    console.warn(`Initial proxy (${config.proxy_type}) failed, trying fallbacks...`);
    lastError = error as Error;
  }
  
  // Try each fallback
  for (const proxyType of fallbackOrder) {
    // Skip if it's the same as initial config
    if (proxyType === config.proxy_type) continue;
    
    try {
      const proxyUrl = buildProxyUrl(url, { proxy_type: proxyType }).url;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) continue;
      
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as T;
    } catch (error) {
      console.warn(`Fallback ${proxyType} failed:`, error);
      lastError = error as Error;
    }
  }
  
  // If all attempts fail, throw the last error
  throw lastError;
}

/**
 * Get current proxy settings from database
 */
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn("Error fetching proxy settings:", error);
      return { proxy_type: 'allorigins' };
    }

    // Return settings or default to allorigins
    return {
      proxy_type: data.proxy_type || 'allorigins',
      custom_url: data.custom_url
    };
  } catch (error) {
    console.error("Failed to fetch proxy settings:", error);
    return { proxy_type: 'allorigins' };
  }
}
