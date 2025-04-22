
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'custom' | 'direct';

export interface ProxyConfig {
  proxy_type: ProxyType;
  custom_url?: string | null;
  id?: string;
}

export interface ProxySettings extends ProxyConfig {
  created_at?: string;
  updated_at?: string;
}

export function buildProxyUrl(url: string, config: ProxyConfig): { url: string } {
  if (!config) {
    return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
  }

  switch (config.proxy_type) {
    case 'allorigins':
      return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
    case 'corsproxy':
      return { url: `https://corsproxy.io/?${encodeURIComponent(url)}` };
    case 'cors-anywhere':
      return { url: `https://cors-anywhere.herokuapp.com/${url}` };
    case 'custom':
      if (config.custom_url) {
        return { url: `${config.custom_url.replace(/\/$/, '')}/${url.replace(/^https?:\/\//, '')}` };
      }
      return { url };
    case 'direct':
      return { url };
    default:
      return { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` };
  }
}

export async function fetchViaProxy(url: string, config?: ProxyConfig): Promise<any> {
  const proxyUrl = buildProxyUrl(url, config || { proxy_type: 'allorigins' });
  const response = await fetch(proxyUrl.url);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  return response.json();
}

export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    return data as ProxyConfig;
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    return { proxy_type: 'allorigins' };
  }
}
