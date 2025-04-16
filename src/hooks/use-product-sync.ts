
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
      .select('*')
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
      const response = await fetch(`/functions/v1/product-sync?action=sync-product&externalId=${externalId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync product');
      }
      
      toast.success('Product synced successfully');
      return data;
    } catch (error) {
      console.error('Sync product error:', error);
      toast.error(`Failed to sync product: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncAllProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/functions/v1/product-sync?action=sync-all`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync all products');
      }
      
      toast.success(`Synced ${data.productsUpdated} products`);
      return data;
    } catch (error) {
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
    return data;
  };
  
  const updateProduct = async ({ id, ...product }: { id: string; [key: string]: any }) => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  };
  
  // Set up React Query hooks
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
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update product: ${error.message}`);
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
    productsError: productsQuery.error,
    syncLogsError: syncLogsQuery.error,
  };
}
