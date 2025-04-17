
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveApiConfig } from '@/utils/apiUtils';

export async function fetchSyncLogs() {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (error) throw error;
  return data;
}

export async function syncProduct(externalId: string) {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, external_id, kiosk_token')
      .eq('external_id', externalId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found or has no kiosk token');
    }
    
    const apiConfig = await fetchActiveApiConfig();
    const timestamp = new Date().getTime();
    
    const headers = {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
      'X-Request-Time': timestamp.toString()
    };
    
    const response = await fetch(`/functions/v1/product-sync?action=sync-product&externalId=${externalId}&userToken=${apiConfig.user_token}&_t=${timestamp}`, {
      headers
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `API error (${response.status})`;
      } catch (e) {
        try {
          errorText = await response.text();
          if (errorText.length > 100) {
            errorText = errorText.substring(0, 100) + "...";
          }
          errorText = `API error (${response.status}): ${errorText}`;
        } catch (textError) {
          errorText = `API error (${response.status}): Unable to read error response`;
        }
      }
      
      console.error('API error response:', errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to sync product');
    }
    
    return data;
  } catch (error) {
    console.error('Sync product error:', error);
    throw error;
  }
}

export async function syncAllProducts() {
  try {
    const apiConfig = await fetchActiveApiConfig();
    
    const timestamp = new Date().getTime();
    const headers = {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
      'X-Request-Time': timestamp.toString()
    };
    
    const response = await fetch(`/functions/v1/product-sync?action=sync-all&userToken=${apiConfig.user_token}&_t=${timestamp}`, {
      headers
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `API error (${response.status})`;
      } catch (e) {
        try {
          errorText = await response.text();
          if (errorText.length > 100) {
            errorText = errorText.substring(0, 100) + "...";
          }
          
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
            errorText = `API error (${response.status}): Received HTML instead of JSON`;
          } else {
            errorText = `API error (${response.status}): ${errorText}`;
          }
        } catch (textError) {
          errorText = `API error (${response.status}): Unable to read error response`;
        }
      }
      
      throw new Error(errorText);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to sync all products');
    }
    
    return data;
  } catch (error) {
    console.error('Sync all products error:', error);
    throw error;
  }
}
