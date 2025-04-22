
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseRecord } from './supabaseHelpers';

export type ProxyType = 'allorigins' | 'corsproxy' | 'corsanywhere' | 'direct' | 'custom' | 'yproxy';

export interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

interface ProxySettings {
  proxy_type: string;
  custom_url?: string;
}

export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching proxy settings:', error);
      return { type: 'allorigins' };
    }

    if (data && isSupabaseRecord<ProxySettings>(data)) {
      return {
        type: data.proxy_type as ProxyType,
        url: data.custom_url
      };
    }

    return { type: 'allorigins' };
  } catch (error) {
    console.error('Failed to fetch proxy settings:', error);
    return { type: 'allorigins' };
  }
}

export function buildProxyUrl(targetUrl: string, proxyConfig: ProxyConfig): string {
  switch (proxyConfig.type) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    case 'yproxy':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    case 'custom':
      if (proxyConfig.url) {
        return `${proxyConfig.url}${encodeURIComponent(targetUrl)}`;
      }
      return targetUrl;
    case 'direct':
    default:
      return targetUrl;
  }
}

export async function fetchViaProxy(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    const proxyUrl = buildProxyUrl(url, proxyConfig);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const text = await response.text();
    
    if (proxyConfig.type === 'allorigins') {
      try {
        const allOriginsData = JSON.parse(text);
        if (allOriginsData.contents) {
          return JSON.parse(allOriginsData.contents);
        }
      } catch (e) {
        console.error('Failed to parse AllOrigins response:', e);
        throw new Error('Invalid response format from AllOrigins');
      }
    } else {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse direct response:', e);
        throw new Error('Invalid JSON response');
      }
    }
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}

// Add the missing function
export async function fetchViaProxyWithFallback(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    // Try different proxy methods in sequence
    const fallbackProxies: ProxyType[] = ['allorigins', 'corsproxy', 'yproxy', 'direct'];
    
    // Start with the requested proxy
    const proxyTypes = [proxyConfig.type, ...fallbackProxies.filter(p => p !== proxyConfig.type)];
    
    let lastError = null;
    
    for (const proxyType of proxyTypes) {
      try {
        const currentConfig = { ...proxyConfig, type: proxyType as ProxyType };
        const result = await fetchViaProxy(url, currentConfig);
        return result;
      } catch (error) {
        console.warn(`Proxy ${proxyType} failed, trying next...`, error);
        lastError = error;
        // Continue to next proxy
      }
    }
    
    // If we get here, all proxies failed
    throw lastError || new Error('All proxy methods failed');
  } catch (error) {
    console.error('Error in fetchViaProxyWithFallback:', error);
    throw error;
  }
}
