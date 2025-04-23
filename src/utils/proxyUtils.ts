
import { safeDatabaseData, safeExtractProperty } from './supabaseTypeUtils';

export type ProxyType = 'allorigins' | 'corsproxy' | 'corsanywhere' | 'direct' | 'custom';

export interface ProxyConfig {
  proxyType: ProxyType;
  customUrl?: string;
}

export function buildProxyUrl(targetUrl: string, config: ProxyConfig): { url: string, method: string } {
  const encodedUrl = encodeURIComponent(targetUrl);
  
  switch(config.proxyType) {
    case 'allorigins':
      return { 
        url: `https://api.allorigins.win/raw?url=${encodedUrl}`,
        method: 'GET'
      };
    case 'corsproxy':
      return { 
        url: `https://corsproxy.io/?${encodedUrl}`,
        method: 'GET'
      };
    case 'corsanywhere':
      return { 
        url: `https://cors-anywhere.herokuapp.com/${targetUrl}`,
        method: 'GET'
      };
    case 'custom':
      if (config.customUrl) {
        return { 
          url: config.customUrl.replace('{{url}}', encodedUrl),
          method: 'GET'
        };
      }
      // Fall back to allorigins if no custom URL provided
      return { 
        url: `https://api.allorigins.win/raw?url=${encodedUrl}`,
        method: 'GET'
      };
    case 'direct':
    default:
      return { 
        url: targetUrl,
        method: 'GET'
      };
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

    if (data && typeof data === 'object') {
      return {
        proxyType: safeExtractProperty(data, 'proxy_type', 'allorigins') as ProxyType,
        customUrl: safeExtractProperty(data, 'custom_url', undefined)
      };
    }

    return { proxyType: 'allorigins' };
  } catch (error) {
    console.error('Error in fetchProxySettings:', error);
    return { proxyType: 'allorigins' };
  }
}
