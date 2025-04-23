
import { safeDatabaseData } from './supabaseTypeUtils';

export type ProxyType = 'allorigins' | 'corsproxy' | 'corsanywhere' | 'direct' | 'custom';

export interface ProxyConfig {
  proxyType: ProxyType;
  customUrl?: string;
}

export function buildProxyUrl(targetUrl: string, config: ProxyConfig): string {
  const encodedUrl = encodeURIComponent(targetUrl);
  
  switch(config.proxyType) {
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodedUrl}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodedUrl}`;
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    case 'custom':
      if (config.customUrl) {
        return config.customUrl.replace('{{url}}', encodedUrl);
      }
      // Fall back to allorigins if no custom URL provided
      return `https://api.allorigins.win/raw?url=${encodedUrl}`;
    case 'direct':
    default:
      return targetUrl;
  }
}

export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching proxy settings:', error);
      return { proxyType: 'allorigins' };
    }

    if (data && typeof data === 'object' && 'proxy_type' in data) {
      return {
        proxyType: data.proxy_type as ProxyType,
        customUrl: data.custom_url || undefined
      };
    }

    return { proxyType: 'allorigins' };
  } catch (error) {
    console.error('Error in fetchProxySettings:', error);
    return { proxyType: 'allorigins' };
  }
}
