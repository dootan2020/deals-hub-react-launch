
import { supabase } from "@/integrations/supabase/client";
import { ProxyConfig } from "@/utils/proxyUtils";
import { extractFromHtml, fetchActiveApiConfig } from "@/utils/apiUtils";
import { buildProxyUrl, getRequestHeaders } from "@/utils/proxyUtils";

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .order('title', { ascending: true });
    
  if (error) throw error;
  return data;
}

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

export async function fetchProductInfoByKioskToken(kioskToken: string, tempProxyOverride: ProxyConfig | null, proxyConfig: ProxyConfig) {
  try {
    const apiConfig = await fetchActiveApiConfig();
    
    // First try with Edge Function to bypass CORS completely
    try {
      const timestamp = new Date().getTime();
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(apiConfig.user_token);
      
      console.log('Trying Edge Function first for reliable API access...');
      const edgeFunctionUrl = `/functions/v1/product-sync?action=check&kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}&_t=${timestamp}`;
      
      const headers = {
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
        'X-Request-Time': timestamp.toString()
      };
      
      const edgeFunctionResponse = await fetch(edgeFunctionUrl, { headers });
      
      if (!edgeFunctionResponse.ok) {
        throw new Error(`Edge function failed: ${edgeFunctionResponse.status}`);
      }
      
      const edgeFunctionData = await edgeFunctionResponse.json();
      console.log('Edge function response:', edgeFunctionData);
      return edgeFunctionData;
    } catch (edgeError) {
      console.error('Edge function error:', edgeError);
      console.log('Falling back to proxy methods...');
      
      // If Edge Function fails, try with proxies
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(apiConfig.user_token);
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}`;
      
      // Use the temporary proxy override if it exists, otherwise use the configured proxy
      const currentProxy = tempProxyOverride || proxyConfig;
      const { url: proxyUrl, description } = buildProxyUrl(apiUrl, currentProxy);
      console.log(description);

      const timestamp = new Date().getTime();
      const headers = getRequestHeaders();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Proxy returned error status: ${response.status}`);
        }
        
        const contentType = response.headers.get('Content-Type');
        console.log(`Content-Type: ${contentType}`);
        
        const responseText = await response.text();
        console.log(`Raw response (first 300 chars): \n${responseText.substring(0, 300)}`);
        
        // Check if response is HTML
        const isHtml = responseText.includes('<!DOCTYPE') || 
                      responseText.includes('<html') || 
                      contentType?.includes('text/html');
                      
        if (isHtml) {
          console.log('Response is HTML, attempting to extract product information');
          const extractedInfo = extractFromHtml(responseText);
          if (extractedInfo) {
            console.log('Using extracted product info from HTML:', extractedInfo);
            
            // Try edge function as final fallback
            try {
              console.log('Invalid API response format, trying Edge Function as final fallback...');
              const edgeFunctionUrl = `/functions/v1/product-sync?action=check&kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}&_t=${timestamp}`;
              const edgeFunctionResponse = await fetch(edgeFunctionUrl, { headers });
              
              if (edgeFunctionResponse.ok) {
                const edgeFunctionData = await edgeFunctionResponse.json();
                console.log('Edge function response:', edgeFunctionData);
                return edgeFunctionData;
              }
            } catch (finalEdgeError) {
              console.error('Final edge function attempt failed:', finalEdgeError);
            }
            
            // If edge function fails too, use whatever we extracted from HTML
            return extractedInfo;
          }
        }
        
        let productInfo;
        
        if (currentProxy.type === 'allorigins' && !proxyUrl.includes('/raw')) {
          try {
            const allOriginsData = JSON.parse(responseText);
            if (allOriginsData && allOriginsData.contents) {
              try {
                productInfo = JSON.parse(allOriginsData.contents);
                console.log('Successfully parsed product info from AllOrigins:', productInfo);
              } catch (innerError) {
                console.error('Error parsing inner JSON from AllOrigins:', innerError);
                throw new Error('Invalid JSON in AllOrigins contents');
              }
            } else {
              throw new Error('Invalid AllOrigins response format');
            }
          } catch (outerError) {
            console.error('Error parsing AllOrigins response:', outerError);
            throw new Error('Failed to parse AllOrigins response');
          }
        } else {
          try {
            productInfo = JSON.parse(responseText);
            console.log('Successfully parsed product info:', productInfo);
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            throw new Error('Invalid JSON response');
          }
        }
        
        return productInfo;
      } catch (proxyError) {
        console.error(`Error with ${currentProxy.type} proxy:`, proxyError);
        
        // Final fallback to edge function
        console.log('All proxies failed, falling back to edge function as last resort...');
        const edgeFunctionUrl = `/functions/v1/product-sync?action=check&kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}&_t=${timestamp}`;
        
        const edgeFunctionResponse = await fetch(edgeFunctionUrl, { headers });
        
        if (!edgeFunctionResponse.ok) {
          throw new Error(`Edge function failed: ${edgeFunctionResponse.status}`);
        }
        
        const edgeFunctionData = await edgeFunctionResponse.json();
        console.log('Edge function response:', edgeFunctionData);
        return edgeFunctionData;
      }
    }
  } catch (error) {
    console.error('Fetch product info error:', error);
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

export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    if (productData.category_id) {
      await updateCategoryCount(productData.category_id);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct({ id, ...product }: { id: string; [key: string]: any }) {
  try {
    const { data: oldProduct, error: fetchError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const oldCategoryId = oldProduct?.category_id;
    
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (oldCategoryId !== product.category_id) {
      if (oldCategoryId) {
        await updateCategoryCount(oldCategoryId);
      }
      if (product.category_id) {
        await updateCategoryCount(product.category_id);
      }
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCategoryCount(categoryId: string) {
  try {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);
    
    if (countError) throw countError;
    
    const { error: updateError } = await supabase
      .from('categories')
      .update({ count: count || 0 })
      .eq('id', categoryId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating category count:', error);
  }
}
