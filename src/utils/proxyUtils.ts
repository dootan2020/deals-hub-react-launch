
import { supabase } from '@/integrations/supabase/client';
import { isValidRecord } from './supabaseHelpers';

// Define ProxyType enum
export type ProxyType = 'allorigins' | 'yproxy' | 'custom' | 'direct';

// Define ProxyConfig interface
export interface ProxyConfig {
  proxyType: ProxyType;
  customUrl?: string;
}

// Default proxy configuration
export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  proxyType: 'allorigins'
};

// Function to fetch proxy settings from database
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .single();

    if (error || !data) {
      console.warn('Failed to fetch proxy settings, using default:', error);
      return DEFAULT_PROXY_CONFIG;
    }

    if (!isValidRecord(data) || !data.proxy_type) {
      return DEFAULT_PROXY_CONFIG;
    }

    return {
      proxyType: data.proxy_type as ProxyType,
      customUrl: data.custom_url
    };
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return DEFAULT_PROXY_CONFIG;
  }
}

// Function to use the proxy to fetch data
export async function fetchViaProxy(url: string, config: ProxyConfig): Promise<any> {
  try {
    switch (config.proxyType) {
      case 'allorigins':
        return await fetchViaAllOrigins(url);
      case 'yproxy':
        return await fetchViaYProxy(url);
      case 'custom':
        return await fetchViaCustomProxy(url, config.customUrl);
      case 'direct':
        return await fetchDirect(url);
      default:
        return await fetchViaAllOrigins(url);
    }
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}

// Fetch via allorigins proxy
async function fetchViaAllOrigins(url: string): Promise<any> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  if (data.contents) {
    try {
      return JSON.parse(data.contents);
    } catch (e) {
      return data.contents;
    }
  }
  
  throw new Error('Failed to fetch data through allorigins proxy');
}

// Fetch via yproxy
async function fetchViaYProxy(url: string): Promise<any> {
  const proxyUrl = `https://api.yunpian.com/proxy/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  if (data) {
    return data;
  }
  
  throw new Error('Failed to fetch data through yproxy');
}

// Fetch via custom proxy
async function fetchViaCustomProxy(url: string, customUrl?: string): Promise<any> {
  if (!customUrl) {
    throw new Error('Custom proxy URL not provided');
  }
  
  const proxyUrl = `${customUrl}?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  if (data) {
    return data;
  }
  
  throw new Error('Failed to fetch data through custom proxy');
}

// Direct fetch (no proxy)
async function fetchDirect(url: string): Promise<any> {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
