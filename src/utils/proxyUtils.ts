
import { supabase } from '@/integrations/supabase/client';

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxySettings {
  type: ProxyType;
  customUrl?: string;
}

export async function fetchProxySettings(): Promise<ProxySettings> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching proxy settings:', error);
      // Default to a fallback proxy if error occurs
      return { type: 'allorigins' };
    }
    
    if (data && data.length > 0) {
      // Use type assertion to safely access properties
      const settings = data[0] as any;
      return {
        type: settings.proxy_type as ProxyType,
        customUrl: settings.custom_url || undefined
      };
    }
    
    // Default to a fallback proxy if no settings found
    return { type: 'allorigins' };
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return { type: 'allorigins' };
  }
}

export function buildProxyUrl(
  targetUrl: string,
  config?: { type?: ProxyType; customUrl?: string }
): { url: string; headers?: Record<string, string> } {
  const proxyType = config?.type || 'allorigins';
  
  switch (proxyType) {
    case 'allorigins':
      return {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
      };
    case 'corsproxy':
      return {
        url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
      };
    case 'cors-anywhere':
      return {
        url: `https://cors-anywhere.herokuapp.com/${targetUrl}`
      };
    case 'direct':
      return {
        url: targetUrl,
        headers: {
          'Content-Type': 'application/json',
        }
      };
    case 'custom':
      if (config?.customUrl) {
        return {
          url: `${config.customUrl}${encodeURIComponent(targetUrl)}`
        };
      }
      // Fall back to allorigins if custom URL is not provided
      return {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
      };
    default:
      return {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
      };
  }
}

export async function fetchViaProxy(url: string, proxyConfig: ProxySettings): Promise<any> {
  try {
    const { url: proxyUrl, headers } = buildProxyUrl(url, proxyConfig);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: headers || {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different proxy response formats
    if (proxyConfig.type === 'allorigins' && data.contents) {
      try {
        // Parse the contents from AllOrigins response
        return JSON.parse(data.contents);
      } catch (e) {
        console.log('Failed to parse JSON from AllOrigins, returning raw contents');
        return data.contents;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}
