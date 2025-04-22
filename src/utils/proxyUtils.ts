
import { supabase } from '@/integrations/supabase/client';

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'serverless' | 'direct' | 'custom';

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
      .single();

    if (error) throw error;
    
    return {
      type: (data.proxy_type as ProxyType) || 'allorigins',
      url: data.custom_url
    };
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    // Default to AllOrigins proxy if settings can't be fetched
    return { type: 'allorigins' };
  }
}

export function buildProxyUrl(url: string, proxyType: ProxyType, customUrl?: string): string {
  switch (proxyType) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'cors-anywhere':
      return `${customUrl || 'https://cors-anywhere.herokuapp.com/'}${url}`;
    case 'direct':
      return url;
    case 'custom':
      if (!customUrl) throw new Error('Custom URL is required for custom proxy type');
      return customUrl.includes('%s') 
        ? customUrl.replace('%s', encodeURIComponent(url))
        : `${customUrl}${encodeURIComponent(url)}`;
    default:
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  }
}

export async function fetchViaProxy(url: string, proxyConfig?: ProxyConfig): Promise<any> {
  if (!proxyConfig) {
    proxyConfig = await fetchProxySettings();
  }
  
  try {
    switch (proxyConfig.type) {
      case 'allorigins':
        return fetchViaAllOrigins(url);
      case 'cors-anywhere':
        return fetchViaCorsAnywhere(url, proxyConfig.url);
      case 'serverless':
        return fetchViaServerless(url);
      case 'corsproxy':
        return fetchViaCorsproxy(url);
      case 'direct':
        return fetchDirectly(url);
      case 'custom':
        return fetchViaCustomProxy(url, proxyConfig.url || '');
      default:
        throw new Error(`Unsupported proxy type: ${proxyConfig.type}`);
    }
  } catch (error) {
    console.error(`Error fetching via ${proxyConfig.type} proxy:`, error);
    throw error;
  }
}

async function fetchViaAllOrigins(url: string): Promise<any> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  if (data.contents) {
    try {
      return JSON.parse(data.contents);
    } catch {
      return { content: data.contents };
    }
  }
  
  throw new Error('Failed to retrieve data from proxy');
}

async function fetchViaCorsAnywhere(url: string, customProxyUrl?: string): Promise<any> {
  const proxyUrl = customProxyUrl || 'https://cors-anywhere.herokuapp.com/';
  const response = await fetch(`${proxyUrl}${url}`);
  
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return { content: text };
  }
}

async function fetchViaCorsproxy(url: string): Promise<any> {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return { content: text };
  }
}

async function fetchDirectly(url: string): Promise<any> {
  const response = await fetch(url);
  
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return { content: text };
  }
}

async function fetchViaCustomProxy(url: string, customUrl: string): Promise<any> {
  if (!customUrl) {
    throw new Error('Custom URL is required for custom proxy type');
  }
  
  const proxyUrl = customUrl.includes('%s') 
    ? customUrl.replace('%s', encodeURIComponent(url))
    : `${customUrl}${encodeURIComponent(url)}`;
    
  const response = await fetch(proxyUrl);
  
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    return { content: text };
  }
}

async function fetchViaServerless(url: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('proxy', {
    body: { url }
  });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchViaProxyWithFallback(url: string): Promise<any> {
  const proxyConfig = await fetchProxySettings();
  
  try {
    // Try primary proxy
    return await fetchViaProxy(url, proxyConfig);
  } catch (primaryError) {
    console.error('Primary proxy failed:', primaryError);
    
    // Fallback to serverless if primary fails
    if (proxyConfig.type !== 'serverless') {
      try {
        console.log('Falling back to serverless proxy...');
        return await fetchViaServerless(url);
      } catch (serverlessError) {
        console.error('Serverless proxy also failed:', serverlessError);
      }
    }
    
    // Fallback to AllOrigins if serverless fails
    if (proxyConfig.type !== 'allorigins') {
      try {
        console.log('Falling back to AllOrigins proxy...');
        return await fetchViaAllOrigins(url);
      } catch (allOriginsError) {
        console.error('AllOrigins proxy also failed:', allOriginsError);
      }
    }
    
    // All methods failed, rethrow the original error
    throw primaryError;
  }
}
