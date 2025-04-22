import { supabase } from '@/integrations/supabase/client';
import { castData } from './supabaseHelpers';

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxySettings {
  proxy_type: ProxyType;
  custom_url?: string | null;
}

export interface ProxyConfig {
  type: ProxyType;
  url?: string;
  fallback?: ProxyType;
}

/**
 * Fetch the current proxy settings from the database
 * @returns The proxy configuration
 */
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data: proxySettings, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching proxy settings:', error);
      return { type: 'allorigins' }; // Default fallback
    }

    if (proxySettings && proxySettings.length > 0) {
      const settings = castData(proxySettings[0], {});
      return {
        type: settings.proxy_type as ProxyType,
        url: settings.custom_url || undefined,
      };
    }

    return { type: 'allorigins' }; // Default fallback
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return { type: 'allorigins' }; // Default fallback
  }
}

/**
 * Fetch data from a URL using the configured proxy
 * @param url The URL to fetch
 * @param proxyConfig The proxy configuration
 * @returns The fetched data
 */
export async function fetchViaProxy(
  url: string,
  proxyConfig: ProxyConfig = { type: 'allorigins' }
): Promise<any> {
  try {
    const proxyUrl = buildProxyUrl(url, proxyConfig);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle different proxy response formats
    if (proxyConfig.type === 'allorigins') {
      return JSON.parse(data.contents);
    } else {
      return data;
    }
  } catch (error) {
    console.error(`Error fetching via proxy ${proxyConfig.type}:`, error);
    throw error;
  }
}

/**
 * Build a proxy URL based on the configuration
 * @param url The original URL
 * @param proxyConfig The proxy configuration
 * @returns The proxied URL
 */
function buildProxyUrl(url: string, proxyConfig: ProxyConfig): string {
  const encodedUrl = encodeURIComponent(url);
  
  switch (proxyConfig.type) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodedUrl}&nocache=${Date.now()}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodedUrl}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
    case 'direct':
      return url;
    case 'custom':
      if (proxyConfig.url) {
        return proxyConfig.url.includes('?') 
          ? `${proxyConfig.url}${encodedUrl}`
          : `${proxyConfig.url}?url=${encodedUrl}`;
      }
      // Fall back to allorigins if custom is selected but no URL is provided
      return `https://api.allorigins.win/get?url=${encodedUrl}`;
    default:
      return `https://api.allorigins.win/get?url=${encodedUrl}`;
  }
}

/**
 * Try multiple proxies in order if one fails
 * @param url The URL to fetch
 * @param proxyConfig The primary proxy configuration
 * @returns The fetched data
 */
export async function fetchViaProxyWithFallback(
  url: string,
  proxyConfig: ProxyConfig = { type: 'allorigins' }
): Promise<any> {
  try {
    return await fetchViaProxy(url, proxyConfig);
  } catch (error) {
    console.log('Primary proxy failed, trying fallback...');
    
    // Try fallback proxy if specified
    if (proxyConfig.fallback && proxyConfig.fallback !== proxyConfig.type) {
      return fetchViaProxy(url, { type: proxyConfig.fallback });
    }
    
    // Otherwise try allorigins as a last resort
    if (proxyConfig.type !== 'allorigins') {
      return fetchViaProxy(url, { type: 'allorigins' });
    }
    
    throw error;
  }
}
