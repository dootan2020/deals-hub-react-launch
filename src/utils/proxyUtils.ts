
import { ProxyType, ProxyConfig, ApiResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { castData, createDefaultProxySettings } from './supabaseHelpers';
import { extractFromHtml, isHtmlResponse, normalizeProductInfo } from './apiUtils';

// Base URLs for different proxy types
const PROXY_URLS = {
  'allorigins': 'https://api.allorigins.win/raw?url=',
  'corsproxy': 'https://corsproxy.io/?',
  'cors-anywhere': 'https://cors-anywhere.herokuapp.com/',
  'direct': '',
  'custom': ''
};

/**
 * Fetch the current proxy settings from the database
 */
export async function getProxySettings(): Promise<ProxyConfig> {
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
    
    const settings = castData(data, createDefaultProxySettings());
    return {
      proxy_type: settings.proxy_type,
      custom_url: settings.custom_url || undefined
    };
  } catch (error) {
    console.error("Failed to fetch proxy settings:", error);
    return { proxy_type: 'allorigins' };
  }
}

/**
 * Build a proxied URL based on the provided proxy type and target URL
 */
export function buildProxiedUrl(targetUrl: string, proxyConfig: ProxyConfig): string {
  const { proxy_type, custom_url } = proxyConfig;
  
  if (proxy_type === 'custom' && custom_url) {
    // Replace placeholder in custom URL if present, otherwise append
    return custom_url.includes('{url}') 
      ? custom_url.replace('{url}', encodeURIComponent(targetUrl))
      : `${custom_url}${encodeURIComponent(targetUrl)}`;
  }
  
  return `${PROXY_URLS[proxy_type]}${encodeURIComponent(targetUrl)}`;
}

/**
 * Fetch data from a URL using the specified proxy
 */
export async function fetchViaProxy(url: string, proxyConfig: ProxyConfig): Promise<any> {
  const proxiedUrl = buildProxiedUrl(url, proxyConfig);
  
  try {
    const response = await fetch(proxiedUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy request failed with status ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  } catch (error) {
    console.error(`Error fetching via ${proxyConfig.proxy_type} proxy:`, error);
    throw error;
  }
}

/**
 * Try multiple proxies in order until one succeeds
 */
export async function fetchViaProxyWithFallback(url: string, initialConfig?: ProxyConfig): Promise<any> {
  // First try with the specified or stored proxy config
  const config = initialConfig || await getProxySettings();
  const fallbackOrder: ProxyType[] = ['allorigins', 'corsproxy', 'cors-anywhere', 'direct'];
  
  try {
    return await fetchViaProxy(url, config);
  } catch (initialError) {
    console.warn(`Initial proxy (${config.proxy_type}) failed, trying fallbacks...`);
    
    // Try each fallback in sequence, skipping the one we already tried
    for (const proxyType of fallbackOrder) {
      if (proxyType === config.proxy_type) continue;
      
      try {
        return await fetchViaProxy(url, { proxy_type: proxyType });
      } catch (error) {
        console.warn(`Fallback ${proxyType} failed:`, error);
        // Continue to next fallback
      }
    }
    
    // If all fallbacks fail, throw the original error
    throw initialError;
  }
}
