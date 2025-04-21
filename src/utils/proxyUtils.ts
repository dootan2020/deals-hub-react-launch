
// src/utils/proxyUtils.ts
import { supabase } from "@/integrations/supabase/client";

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom' | 'jsonp' | 'yproxy' | 'Mobile' | 'Residential' | 'Dedicated';

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
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
        description: `AllOrigins GET proxy: ${`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
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
    case 'jsonp':
      return { 
        url: `https://jsonp.afeld.me/?url=${encodeURIComponent(apiUrl)}`,
        description: `JSONP Proxy: ${apiUrl.substring(0, 60)}...`
      };
    case 'yproxy':
      return { 
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
        description: `YProxy (AllOrigins RAW): ${apiUrl.substring(0, 60)}...`
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
    // Handle the new enum values
    case 'Mobile':
    case 'Residential':
    case 'Dedicated':
      return {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent('https://api.example.com/proxy?type=' + proxyConfig.type)}`,
        description: `${proxyConfig.type} proxy test`
      };
    default:
      return { 
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
        description: `Default AllOrigins GET proxy: ${`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`.substring(0, 60)}...`
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

// Enhanced fetchViaProxy that can handle all types of CORS proxy requests
export async function fetchViaProxy(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    // Build the proxy URL using the provided config
    const { url: proxyUrl } = buildProxyUrl(url, proxyConfig);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Make the request with appropriate headers
      const response = await fetch(proxyUrl, {
        headers: getRequestHeaders(),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if response received
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        
        // Handle AllOrigins specific response format
        if (proxyConfig.type === 'allorigins' && data.contents) {
          try {
            // Try to parse contents as JSON
            return JSON.parse(data.contents);
          } catch (parseError) {
            // If contents is not valid JSON, return it as is
            return data.contents;
          }
        }
        
        return data;
      } catch (jsonError) {
        // If response is not valid JSON, return it as text
        return responseText;
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout after 15 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    throw error;
  }
}

// Alternative fetchViaProxy with Supabase serverless function fallback
export async function fetchViaProxyWithFallback(url: string, proxyConfig: ProxyConfig): Promise<any> {
  try {
    return await fetchViaProxy(url, proxyConfig);
  } catch (error) {
    console.error('Proxy fetch failed, trying serverless fallback:', error);
    
    // Fallback to Supabase function
    const { data, error: fnError } = await supabase.functions.invoke('proxy-api', {
      body: { url: url }
    });
    
    if (fnError) {
      throw fnError;
    }
    
    return data;
  }
}
