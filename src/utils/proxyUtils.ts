import { supabase } from '@/integrations/supabase/client';
import { isRecord } from './supabaseHelpers';

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

export interface ProxySettings {
  proxyUrl: string;
  appendMode: 'prefix' | 'suffix' | 'path';
}

/**
 * Create a proxy URL based on the specified proxy type and target URL
 * @param url The URL to proxy
 * @param config The proxy configuration
 * @returns An object with the proxied URL
 */
export function buildProxyUrl(url: string, config: ProxyConfig): { url: string } {
  switch (config.type) {
    case 'allorigins':
      return { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}` };
    
    case 'corsproxy':
      return { url: `https://corsproxy.io/?${encodeURIComponent(url)}` };
      
    case 'cors-anywhere':
      return { url: `https://cors-anywhere.herokuapp.com/${url}` };
      
    case 'custom':
      if (config.url) {
        return { url: `${config.url}${encodeURIComponent(url)}` };
      }
      // Fallback to allorigins if custom URL is missing
      return { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}` };
      
    case 'direct':
      return { url };
      
    default:
      // Default to allorigins
      return { url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}` };
  }
}

/**
 * Fetch the current proxy settings from the database
 * @returns Promise<ProxyConfig> the proxy configuration
 */
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (isRecord(data)) {
      const proxyType = typeof data.proxy_type === 'string' 
        ? data.proxy_type as ProxyType 
        : 'allorigins';

      const customUrl = typeof data.custom_url === 'string' 
        ? data.custom_url 
        : undefined;

      return {
        type: proxyType,
        url: customUrl
      };
    }

    // Return default if no configuration is found
    return { type: 'allorigins' };
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return { type: 'allorigins' }; // Default to allorigins on error
  }
}

/**
 * Process a response from a proxied request based on the proxy type
 * @param response The response from the proxied request
 * @param proxyType The type of proxy used
 * @returns The processed response content
 */
export async function processProxyResponse(response: Response, proxyType: ProxyType): Promise<any> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  try {
    switch (proxyType) {
      case 'allorigins': {
        const data = await response.json();
        // AllOrigins returns { contents: string, status: { ... } }
        if (data?.contents) {
          try {
            return JSON.parse(data.contents);
          } catch (e) {
            return data.contents;
          }
        }
        return data;
      }
      
      case 'corsproxy':
      case 'cors-anywhere':
      case 'direct':
        return isJson ? await response.json() : await response.text();
        
      case 'custom':
        // Try to detect format and parse appropriately
        if (isJson) {
          const data = await response.json();
          // Check if this might be an allorigins-like response
          if (data?.contents) {
            try {
              return JSON.parse(data.contents);
            } catch (e) {
              return data.contents;
            }
          }
          return data;
        }
        return await response.text();
        
      default:
        return isJson ? await response.json() : await response.text();
    }
  } catch (error) {
    console.error('Error processing proxy response:', error);
    throw new Error('Failed to process proxy response');
  }
}

/**
 * Fetch data via the configured proxy
 * @param url The URL to fetch
 * @param proxyConfig The proxy configuration
 * @returns The fetched data
 */
export async function fetchViaProxy(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    const proxiedUrl = buildProxyUrl(url, proxyConfig);
    
    const response = await fetch(proxiedUrl.url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await processProxyResponse(response, proxyConfig.type);
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}
