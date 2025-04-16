import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ProxyType } from '@/components/admin/CorsProxySelector';

interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

export function useProductSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    type: 'allorigins'
  });
  const queryClient = useQueryClient();
  
  useEffect(() => {
    fetchProxySettings();
  }, []);
  
  const fetchProxySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('proxy_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error fetching proxy settings:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setProxyConfig({
          type: data[0].proxy_type as ProxyType,
          url: data[0].custom_url || undefined
        });
        console.log('Using proxy settings:', data[0].proxy_type);
      } else {
        console.log('No proxy settings found, using default (allorigins)');
      }
    } catch (error) {
      console.error('Failed to fetch proxy settings:', error);
    }
  };
  
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories:category_id(*)')
      .order('title', { ascending: true });
      
    if (error) throw error;
    return data;
  };
  
  const fetchSyncLogs = async () => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    return data;
  };
  
  const syncProduct = async (externalId: string) => {
    setIsLoading(true);
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, external_id, kiosk_token')
        .eq('external_id', externalId)
        .single();

      if (productError || !product) {
        throw new Error('Product not found or has no kiosk token');
      }

      const { data: apiConfig, error: configError } = await supabase
        .from('api_configs')
        .select('user_token')
        .eq('is_active', true)
        .order('created_at', { ascending: Math.random() > 0.5 })
        .limit(1)
        .single();
        
      if (configError || !apiConfig) {
        throw new Error('No active API configuration found');
      }

      const timestamp = new Date().getTime();
      
      // Adding custom header to avoid caching
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
      
      toast.success('Product synced successfully');
      return data;
    } catch (error: any) {
      console.error('Sync product error:', error);
      toast.error(`Failed to sync product: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProductInfoByKioskToken = async (kioskToken: string) => {
    setIsLoading(true);
    try {
      const { data: apiConfig, error: configError } = await supabase
        .from('api_configs')
        .select('user_token')
        .eq('is_active', true)
        .order('created_at', { ascending: Math.random() > 0.5 })
        .limit(1)
        .single();

      if (configError || !apiConfig) {
        throw new Error('No active API configuration found');
      }

      console.log(`Using user token: ${apiConfig.user_token.substring(0, 8)}... for product lookup`);
      
      // URL encode the parameters for safety
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(apiConfig.user_token);
      
      // Original API URL
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}`;
      
      // Create the proxy URL based on selected proxy type
      let proxyUrl: string;
      
      switch (proxyConfig.type) {
        case 'allorigins':
          proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
          console.log(`Using AllOrigins proxy: ${proxyUrl.substring(0, 60)}...`);
          break;
        case 'corsproxy':
          proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          console.log(`Using CORS Proxy: ${proxyUrl.substring(0, 60)}...`);
          break;
        case 'custom':
          if (!proxyConfig.url) {
            throw new Error('Custom proxy URL is not configured');
          }
          proxyUrl = `${proxyConfig.url}${encodeURIComponent(apiUrl)}`;
          console.log(`Using custom proxy: ${proxyUrl.substring(0, 60)}...`);
          break;
        case 'direct':
          proxyUrl = apiUrl;
          console.log(`Using direct API call: ${proxyUrl}`);
          break;
        default:
          proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
          console.log(`Using default AllOrigins proxy: ${proxyUrl.substring(0, 60)}...`);
      }
      
      const timestamp = new Date().getTime();
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Request-Time': timestamp.toString()
      };
      
      try {
        // Try using the configured proxy
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Proxy returned error status: ${response.status}`);
        }
        
        // Check content type for debugging
        const contentType = response.headers.get('Content-Type');
        console.log(`Content-Type: ${contentType}`);
        
        // Try to get response as text first to inspect what we're getting
        const responseText = await response.text();
        console.log(`Raw response (first 300 chars): \n${responseText.substring(0, 300)}`);
        
        // Check if response is HTML
        const isHtml = responseText.includes('<!DOCTYPE') || responseText.includes('<html');
        if (isHtml) {
          console.log('Response is HTML, attempting to extract product information');
          // Try to extract from HTML if possible
          const extractedInfo = extractFromHtml(responseText);
          if (extractedInfo) {
            return extractedInfo;
          }
          throw new Error('Received HTML instead of expected JSON');
        }
        
        // Parse the text as JSON
        let productInfo;
        
        try {
          // If using AllOrigins, the response is wrapped
          if (proxyConfig.type === 'allorigins') {
            const allOriginsData = JSON.parse(responseText);
            if (allOriginsData && allOriginsData.contents) {
              productInfo = JSON.parse(allOriginsData.contents);
            } else {
              throw new Error('Invalid AllOrigins response format');
            }
          } else {
            // For other proxies, parse directly
            productInfo = JSON.parse(responseText);
          }
          
          console.log('Parsed product info:', productInfo);
          return productInfo;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Failed to parse product information from response');
        }
      } catch (proxyError) {
        console.error(`Error with ${proxyConfig.type} proxy:`, proxyError);
        
        // Fall back to edge function as last resort
        console.log('Falling back to edge function...');
        const edgeFunctionUrl = `/functions/v1/product-sync?action=check&kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}&_t=${timestamp}`;
        
        const edgeFunctionResponse = await fetch(edgeFunctionUrl, { headers });
        
        if (!edgeFunctionResponse.ok) {
          throw new Error(`Edge function failed: ${edgeFunctionResponse.status}`);
        }
        
        const edgeFunctionData = await edgeFunctionResponse.json();
        console.log('Edge function response:', edgeFunctionData);
        return edgeFunctionData;
      }
    } catch (error: any) {
      console.error('Fetch product info error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractFromHtml = (html: string) => {
    try {
      // Try to extract product name
      const nameMatch = html.match(/<title>(.*?)<\/title>/i);
      const name = nameMatch ? nameMatch[1].replace(" - TapHoaMMO", "").trim() : null;
      
      // Try to extract price (this is a simplistic approach)
      let price = null;
      const priceMatch = html.match(/(\d+(\.\d+)?)\s*USD/i) || html.match(/\$\s*(\d+(\.\d+)?)/i);
      if (priceMatch) {
        price = priceMatch[1];
      }
      
      // Try to extract if it's in stock
      let inStock = true;
      if (html.includes("Out of stock") || html.includes("Hết hàng")) {
        inStock = false;
      }
      
      // If we extracted something useful, return it
      if (name || price) {
        return {
          success: "true",
          name: name || "Information extracted from HTML",
          price: price || "0",
          stock: inStock ? "1" : "0",
          description: "Information extracted from HTML response"
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting data from HTML:", error);
      return null;
    }
  };
  
  const syncAllProducts = async () => {
    setIsLoading(true);
    try {
      const { data: apiConfig, error: configError } = await supabase
        .from('api_configs')
        .select('user_token')
        .eq('is_active', true)
        .order('created_at', { ascending: Math.random() > 0.5 })
        .limit(1)
        .single();
        
      if (configError || !apiConfig) {
        throw new Error('No active API configuration found');
      }
      
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
            
            // Check if response is HTML
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
      
      toast.success(`Synced ${data.productsUpdated} products`);
      return data;
    } catch (error: any) {
      console.error('Sync all products error:', error);
      toast.error(`Failed to sync all products: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const createProduct = async (productData: any) => {
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
  };
  
  const updateProduct = async ({ id, ...product }: { id: string; [key: string]: any }) => {
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
  };

  const updateCategoryCount = async (categoryId: string) => {
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
  };
  
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  const syncLogsQuery = useQuery({
    queryKey: ['syncLogs'],
    queryFn: fetchSyncLogs,
  });
  
  const syncProductMutation = useMutation({
    mutationFn: syncProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
    },
  });
  
  const syncAllMutation = useMutation({
    mutationFn: syncAllProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
    },
  });
  
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const fetchProductInfoMutation = useMutation({
    mutationFn: fetchProductInfoByKioskToken,
    onError: (error: any) => {
      toast.error(`Failed to fetch product information: ${error.message}`);
    },
  });
  
  return {
    products: productsQuery.data || [],
    syncLogs: syncLogsQuery.data || [],
    isLoading: isLoading || productsQuery.isLoading || syncLogsQuery.isLoading,
    isProductsLoading: productsQuery.isLoading,
    isSyncLogsLoading: syncLogsQuery.isLoading,
    syncProduct: syncProductMutation.mutate,
    syncAllProducts: syncAllMutation.mutate,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    fetchProductInfo: (kioskToken: string) => fetchProductInfoMutation.mutateAsync(kioskToken),
    productsError: productsQuery.error,
    syncLogsError: syncLogsQuery.error,
  };
}
