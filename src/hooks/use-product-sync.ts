import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProductSync() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
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
      
      // Use AllOrigins as a proxy to avoid CORS issues
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
      
      console.log(`Attempting API call via AllOrigins proxy: ${allOriginsUrl}`);
      
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
        // Try using AllOrigins proxy first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(allOriginsUrl, { 
          signal: controller.signal,
          headers
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`AllOrigins proxy returned error status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AllOrigins response data:', data);
        
        if (data && data.contents) {
          try {
            // Parse the contents from AllOrigins response
            const productInfo = JSON.parse(data.contents);
            console.log('Parsed product info from AllOrigins:', productInfo);
            return productInfo;
          } catch (parseError) {
            console.error('Error parsing JSON from AllOrigins response:', parseError);
            throw new Error('Failed to parse product information from AllOrigins response');
          }
        } else {
          throw new Error('Invalid data structure from AllOrigins');
        }
      } catch (allOriginsError) {
        console.error('AllOrigins proxy error:', allOriginsError);
        
        // Try alternative proxy - corsproxy.io
        console.log('Trying alternative proxy - corsproxy.io...');
        const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        
        try {
          const corsProxyResponse = await fetch(corsProxyUrl, { headers });
          
          if (!corsProxyResponse.ok) {
            throw new Error(`CORS proxy returned error status: ${corsProxyResponse.status}`);
          }
          
          const corsProxyData = await corsProxyResponse.text();
          console.log('CORS proxy response (first 300 chars):', corsProxyData.substring(0, 300));
          
          try {
            const productInfo = JSON.parse(corsProxyData);
            console.log('Parsed product info from CORS proxy:', productInfo);
            return productInfo;
          } catch (parseError) {
            console.error('Error parsing JSON from CORS proxy:', parseError);
            throw new Error('Failed to parse product information from CORS proxy');
          }
        } catch (corsProxyError) {
          console.error('CORS proxy error:', corsProxyError);
          
          // Last resort - try our edge function as fallback
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
      }
    } catch (error: any) {
      console.error('Fetch product info error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
