
import { supabase } from '@/integrations/supabase/client';

interface ProxySettings {
  proxy_type: string;
  custom_url?: string;
}

export async function fetchProxySettings(): Promise<ProxySettings> {
  try {
    const { data, error } = await supabase
      .from('proxy_settings')
      .select('*')
      .single();

    if (error) throw error;
    
    return data as ProxySettings;
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
    // Default to AllOrigins proxy if settings can't be fetched
    return { proxy_type: 'allorigins' };
  }
}

export async function fetchViaProxy(url: string, proxySettings?: ProxySettings): Promise<any> {
  if (!proxySettings) {
    proxySettings = await fetchProxySettings();
  }
  
  try {
    switch (proxySettings.proxy_type) {
      case 'allorigins':
        return fetchViaAllOrigins(url);
      case 'cors-anywhere':
        return fetchViaCorsAnywhere(url, proxySettings.custom_url);
      case 'serverless':
        return fetchViaServerless(url);
      default:
        throw new Error(`Unsupported proxy type: ${proxySettings.proxy_type}`);
    }
  } catch (error) {
    console.error(`Error fetching via ${proxySettings.proxy_type} proxy:`, error);
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

async function fetchViaServerless(url: string): Promise<any> {
  const { data, error } = await supabase.functions.invoke('proxy', {
    body: { url }
  });
  
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchViaProxyWithFallback(url: string): Promise<any> {
  const proxySettings = await fetchProxySettings();
  
  try {
    // Try primary proxy
    return await fetchViaProxy(url, proxySettings);
  } catch (primaryError) {
    console.error('Primary proxy failed:', primaryError);
    
    // Fallback to serverless if primary fails
    if (proxySettings.proxy_type !== 'serverless') {
      try {
        console.log('Falling back to serverless proxy...');
        return await fetchViaServerless(url);
      } catch (serverlessError) {
        console.error('Serverless proxy also failed:', serverlessError);
      }
    }
    
    // Fallback to AllOrigins if serverless fails
    if (proxySettings.proxy_type !== 'allorigins') {
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
