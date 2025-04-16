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

      const timestamp = new Date().getTime();
      console.log(`Using user token: ${apiConfig.user_token.substring(0, 8)}... for product lookup`);
      
      // Trực tiếp gọi edge function với các tham số đã được mã hóa URL
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(apiConfig.user_token);
      
      // Add a longer timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      // Enhanced headers for improved browser compatibility
      const headers = {
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
        'X-Request-Time': timestamp.toString(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'X-Requested-With': 'XMLHttpRequest'
      };
      
      try {
        const response = await fetch(
          `/functions/v1/product-sync?action=check&kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}&_t=${timestamp}`,
          { 
            signal: controller.signal,
            headers
          }
        );
        
        clearTimeout(timeoutId);
        
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
                errorText = `API error (${response.status}): Received HTML instead of JSON. Vui lòng kiểm tra lại kết nối.`;
              } else {
                errorText = `API error (${response.status}): ${errorText}`;  
              }
            } catch (textError) {
              errorText = `API error (${response.status}): Unable to read error response`;
            }
          }
          
          console.error('API error response:', errorText);
          throw new Error(errorText);
        }
        
        // Check if response is not JSON 
        const contentType = response.headers.get("content-type");
        console.log(`Content-Type: ${contentType}`);
        
        const responseText = await response.text();
        console.log(`Raw response (first 300 chars): ${responseText.substring(0, 300)}`);
        
        // Check if response is HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html')) {
          console.log('Response is HTML, attempting to extract product information');
          
          // Try to extract product name from HTML title
          const nameMatch = responseText.match(/<title>(.*?)<\/title>/i);
          const name = nameMatch ? nameMatch[1].replace(" - TapHoaMMO", "").trim() : "Unknown Product";
          
          // Try to extract price (this is a simplistic approach)
          let price = "0";
          const priceMatch = responseText.match(/(\d+(\.\d+)?)\s*USD/i) || responseText.match(/\$\s*(\d+(\.\d+)?)/i);
          if (priceMatch) {
            price = priceMatch[1];
          }
          
          // Try to extract if it's in stock
          let stock = "0";
          if (!responseText.includes("Out of stock") && !responseText.includes("Hết hàng")) {
            stock = "1";
          }
          
          // Return extracted info
          return {
            success: 'true',
            name: name,
            price: price,
            stock: stock,
            description: 'Information extracted from HTML response'
          };
        }
        
        try {
          const data = JSON.parse(responseText);
          console.log('Parsed data:', data);
          return data;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Failed to parse API response: ${parseError.message}`);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout: API took too long to respond');
        }
        throw fetchError;
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
  };
  
  const updateProduct = async ({ id, ...product }: { id: string; [key: string]: any }) => {
    const { data: oldProduct } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', id)
      .single();
      
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
