
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { safeId, extractSafeData } from '@/utils/supabaseHelpers';

interface ProxyConfig {
  proxyType: string;
  customUrl?: string;
}

// Fix by removing the 'type' property
const defaultProxyConfig: ProxyConfig = {
  proxyType: 'allorigins'
};

export function useProductSync() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>(defaultProxyConfig);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncAllProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch all products with external_id
      const { data, error } = await supabase
        .from('products')
        .select('external_id')
        .not('external_id', 'is', null);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Sync each product
        for (const product of data) {
          const externalId = extractSafeData<{external_id: string}>(product)?.external_id;
          if (externalId) {
            await syncProduct(externalId);
          }
        }
      }
      
      toast.success('All products synced successfully');
    } catch (error) {
      console.error('Error syncing all products:', error);
      toast.error('Failed to sync all products');
    } finally {
      setIsLoading(false);
      fetchProducts();
    }
  };
  
  const syncProduct = async (id: string) => {
    setIsLoading(true);
    try {
      // Call the function to sync the product
      const { error } = await supabase.functions.invoke('sync-product', {
        body: { externalId: id }
      });
      
      if (error) throw error;
      
      toast.success(`Product ${id} synced successfully`);
    } catch (error) {
      console.error(`Error syncing product ${id}:`, error);
      toast.error(`Failed to sync product ${id}`);
    } finally {
      setIsLoading(false);
      fetchProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', safeId(id));

      if (error) throw error;

      toast.success(`Product ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      toast.error(`Failed to delete product ${id}`);
    } finally {
      setIsLoading(false);
      fetchProducts();
    }
  };

  const createProduct = async (productData: any) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase
        .from('products')
        .insert(productData)
        .select();

      if (error) throw error;
      
      toast.success('Product created successfully');
      return data;
    } catch (error) {
      console.error(`Error creating product:`, error);
      toast.error(`Failed to create product`);
      throw error;
    } finally {
      setIsLoading(false);
      fetchProducts();
    }
  };

  const updateProduct = async (productData: any) => {
    const { id, ...updatedData } = productData;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', safeId(id));

      if (error) throw error;
      
      toast.success('Product updated successfully');
    } catch (error) {
      console.error(`Error updating product:`, error);
      toast.error(`Failed to update product`);
      throw error;
    } finally {
      setIsLoading(false);
      fetchProducts();
    }
  };
  
  return {
    products,
    isLoading,
    syncAllProducts,
    syncProduct,
    deleteProduct,
    createProduct,
    updateProduct
  };
}
