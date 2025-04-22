
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

    if (data && isRecord(data)) {
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
 * Create a proxy URL based on the specified proxy type and target URL
 * @param targetUrl The URL to proxy
 * @param proxyConfig The proxy configuration
 * @returns The proxied URL
 */
export function createProxyUrl(targetUrl: string, proxyConfig: ProxyConfig): string {
  switch (proxyConfig.type) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
      
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
      
    case 'custom':
      if (proxyConfig.url) {
        return `${proxyConfig.url}${encodeURIComponent(targetUrl)}`;
      }
      // Fallback to allorigins if custom URL is missing
      return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
    case 'direct':
      return targetUrl;
      
    default:
      // Default to allorigins
      return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
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
