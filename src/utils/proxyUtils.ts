
import { supabase } from '@/integrations/supabase/client';

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom' | 'yproxy';

export interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

export interface ProxySettings {
  proxy_type: ProxyType;
  custom_url: string | null;
}

/**
 * Fetches the current proxy settings from the database
 */
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching proxy settings:', error);
      return { type: 'allorigins' };
    }

    if (data && data.length > 0 && data[0]) {
      return {
        type: (data[0].proxy_type as ProxyType) || 'allorigins',
        url: data[0].custom_url || undefined
      };
    }

    return { type: 'allorigins' };
  } catch (err) {
    console.error('Failed to fetch proxy settings:', err);
    return { type: 'allorigins' };
  }
}

/**
 * Applies the appropriate proxy to the given URL
 */
export function applyProxy(url: string, proxyConfig: ProxyConfig): string {
  switch (proxyConfig.type) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
    case 'yproxy':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    case 'custom':
      return proxyConfig.url ? `${proxyConfig.url}${encodeURIComponent(url)}` : url;
    case 'direct':
      return url;
    default:
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  }
}

/**
 * Process API response based on the proxy used
 */
export function processProxyResponse(response: any, proxyConfig: ProxyConfig): any {
  if (proxyConfig.type === 'allorigins' && response?.contents) {
    try {
      return JSON.parse(response.contents);
    } catch (e) {
      console.error('Error parsing AllOrigins response:', e);
      return response.contents;
    }
  }
  
  return response;
}

/**
 * Fetch data via a proxy
 */
export async function fetchViaProxy(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    const proxiedUrl = applyProxy(url, proxyConfig);
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return processProxyResponse(data, proxyConfig);
  } catch (error) {
    console.error(`Error fetching via proxy (${proxyConfig.type}):`, error);
    throw error;
  }
}

/**
 * Fetch with fallback to another proxy if the first one fails
 */
export async function fetchViaProxyWithFallback(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    return await fetchViaProxy(url, proxyConfig);
  } catch (error) {
    console.warn(`Primary proxy failed, trying fallback...`);
    // Try with allorigins as fallback
    const fallbackConfig: ProxyConfig = { type: 'allorigins' };
    return await fetchViaProxy(url, fallbackConfig);
  }
}
