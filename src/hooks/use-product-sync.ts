
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import { 
  fetchProducts, 
  fetchSyncLogs,
  syncProduct as apiSyncProduct,
  syncAllProducts as apiSyncAllProducts, 
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct
} from "@/services/product";
import { fetchProxySettings, ProxyConfig, ProxyType } from "@/utils/proxyUtils";

export type { ProxyType } from "@/utils/proxyUtils";

export function useProductSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    type: 'allorigins'
  });
  const [tempProxyOverride, setTempProxyOverride] = useState<ProxyConfig | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    initializeProxySettings();
  }, []);
  
  const initializeProxySettings = async () => {
    const config = await fetchProxySettings();
    setProxyConfig(config);
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
    mutationFn: async (externalId: string) => {
      setIsLoading(true);
      try {
        const result = await apiSyncProduct(externalId);
        toast.success('Product synced successfully');
        return result;
      } catch (error: any) {
        toast.error(`Failed to sync product: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
    },
  });
  
  const syncAllMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        const result = await apiSyncAllProducts();
        toast.success(`Synced ${result.productsUpdated} products`);
        return result;
      } catch (error: any) {
        toast.error(`Failed to sync all products: ${error.message}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['syncLogs'] });
    },
  });
  
  const createProductMutation = useMutation({
    mutationFn: apiCreateProduct,
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
    mutationFn: apiUpdateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    setTempProxyOverride,
    productsError: productsQuery.error,
    syncLogsError: syncLogsQuery.error,
  };
}
