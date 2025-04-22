
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'custom' | 'direct' | 'yproxy';

export interface ProxyConfig {
  proxy_type: ProxyType;
  custom_url?: string | null;
  id?: string;
}

export interface ProxySettings extends ProxyConfig {
  created_at?: string;
  updated_at?: string;
}

// Helper to check if a response is HTML
export function isHtmlResponse(response: string): boolean {
  const htmlPattern = /<(!DOCTYPE|html|head|body|div|script)/i;
  return htmlPattern.test(response.trim());
}

export function buildProxyUrl(url: string, config: ProxyConfig): { url: string } {
  if (!config) {
    return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
  }

  switch (config.proxy_type) {
    case 'allorigins':
      return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
    case 'corsproxy':
      return { url: `https://corsproxy.io/?${encodeURIComponent(url)}` };
    case 'cors-anywhere':
      return { url: `https://cors-anywhere.herokuapp.com/${url}` };
    case 'custom':
      if (config.custom_url) {
        return { url: `${config.custom_url.replace(/\/$/, '')}/${url.replace(/^https?:\/\//, '')}` };
      }
      return { url };
    case 'direct':
      return { url };
    case 'yproxy':
      return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
    default:
      return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
  }
}

export async function fetchViaProxy(url: string, config?: ProxyConfig): Promise<any> {
  const proxyUrl = buildProxyUrl(url, config || { proxy_type: 'allorigins' });
  const response = await fetch(proxyUrl.url);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
  // Try to parse as JSON, but handle text responses
  try {
    return await response.json();
  } catch (e) {
    return await response.text();
  }
}

// Fallback function to try different proxy methods
export async function fetchViaProxyWithFallback(url: string, initialConfig?: ProxyConfig): Promise<any> {
  // First try with the provided config
  try {
    return await fetchViaProxy(url, initialConfig);
  } catch (error) {
    console.error(`Error with primary proxy (${initialConfig?.proxy_type}):`, error);
    
    // Try with alternative proxies in order of reliability
    const fallbackProxies: ProxyType[] = ['allorigins', 'corsproxy', 'cors-anywhere', 'direct'];
    
    // Remove the initial config's proxy type if it's in our fallback list
    if (initialConfig?.proxy_type) {
      const index = fallbackProxies.indexOf(initialConfig.proxy_type);
      if (index !== -1) {
        fallbackProxies.splice(index, 1);
      }
    }
    
    // Try each proxy until one works
    for (const proxyType of fallbackProxies) {
      try {
        console.log(`Trying fallback proxy: ${proxyType}`);
        return await fetchViaProxy(url, { proxy_type: proxyType });
      } catch (fallbackError) {
        console.error(`Error with fallback proxy ${proxyType}:`, fallbackError);
      }
    }
    
    // If all fail, throw the original error
    throw error;
  }
}

export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    return data as ProxyConfig;
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return { proxy_type: 'allorigins' };
  }
}
