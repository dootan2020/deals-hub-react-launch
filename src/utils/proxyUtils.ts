
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseRecord } from './supabaseHelpers';

export type ProxyType = 'allorigins' | 'corsproxy' | 'corsanywhere' | 'direct' | 'custom';

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
