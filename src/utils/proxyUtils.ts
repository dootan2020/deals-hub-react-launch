
import { supabase } from "@/integrations/supabase/client";

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

export interface ProxySettings {
  id: string;
  proxy_type: string;
  custom_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data: proxySettings, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching proxy settings:', error);
      return { type: 'allorigins' };
    }
    
    if (proxySettings && proxySettings.length > 0) {
      console.log('Using proxy settings:', proxySettings[0].proxy_type);
      return {
        type: proxySettings[0].proxy_type as ProxyType,
        url: proxySettings[0].custom_url || undefined
      };
    } else {
      console.log('No proxy settings found, using default (allorigins)');
      return { type: 'allorigins' };
    }
  } catch (error) {
    console.error('Failed to fetch proxy settings:', error);
    return { type: 'allorigins' };
  }
}

export function buildProxyUrl(apiUrl: string, proxyConfig: ProxyConfig): { url: string, description: string } {
  switch (proxyConfig.type) {
    case 'allorigins':
      return { 
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
        description: `AllOrigins RAW proxy: ${`https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
      };
    case 'corsproxy':
      return { 
        url: `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
        description: `CORS Proxy: ${`https://corsproxy.io/?${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
      };
    case 'cors-anywhere':
      return { 
        url: `https://cors-anywhere.herokuapp.com/${apiUrl}`,
        description: `CORS Anywhere proxy: ${`https://cors-anywhere.herokuapp.com/${apiUrl}`.substring(0, 60)}...`
      };
    case 'custom':
      if (!proxyConfig.url) {
        throw new Error('Custom proxy URL is not configured');
      }
      return { 
        url: `${proxyConfig.url}${encodeURIComponent(apiUrl)}`,
        description: `Custom proxy: ${`${proxyConfig.url}${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
      };
    case 'direct':
      return { 
        url: apiUrl,
        description: `Direct API call: ${apiUrl}`
      };
    default:
      return { 
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
        description: `Default AllOrigins RAW proxy: ${`https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
      };
  }
}

export function getRequestHeaders(): HeadersInit {
  const timestamp = new Date().getTime();
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Request-Time': timestamp.toString(),
    'Content-Type': 'application/json',
    'Origin': 'https://taphoammo.net',
    'Referer': 'https://taphoammo.net/'
  };
}
