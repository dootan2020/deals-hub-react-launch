
import { supabase } from "@/integrations/supabase/client";
import { fetchProductInfoByKioskToken } from "./mockProductService";
import { ProxyConfig } from "@/utils/proxyUtils";

export async function fetchSyncLogs() {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*, product:product_id(title, external_id)')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    throw error;
  }
}

export async function syncProduct(externalId: string) {
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, kiosk_token')
      .eq('external_id', externalId)
      .maybeSingle();
      
    if (fetchError) throw fetchError;
    if (!product || !product.kiosk_token) {
      throw new Error(`Product with external ID ${externalId} not found or has no kiosk_token`);
    }
    
    await createSyncLog({
      action: 'sync_product',
      status: 'started',
      product_id: product.id,
      message: `Starting sync for product with external ID ${externalId}`
    });
    
    const apiConfig = await import('@/utils/apiUtils').then(module => module.fetchActiveApiConfig());
    const proxyConfig = await import('@/utils/proxyUtils').then(module => module.fetchProxySettings());
    
    const productInfo = await fetchProductInfoByKioskToken(product.kiosk_token, null, proxyConfig);
    
    if (!productInfo || productInfo.success !== 'true') {
      throw new Error('Failed to fetch product info from API');
    }
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        api_name: productInfo.name,
        api_price: parseFloat(productInfo.price),
        api_stock: parseInt(productInfo.stock, 10),
        last_synced_at: new Date().toISOString()
      })
      .eq('id', product.id)
      .select('id, title')
      .single();
      
    if (updateError) throw updateError;
    
    await createSyncLog({
      action: 'sync_product',
      status: 'success',
      product_id: product.id,
      message: `Successfully synced product: ${updatedProduct.title}`
    });
    
    return updatedProduct;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing product:', errorMessage);
    
    await createSyncLog({
      action: 'sync_product',
      status: 'error',
      message: `Error syncing product: ${errorMessage}`
    });
    
    throw error;
  }
}

export async function syncAllProducts() {
  try {
    await createSyncLog({
      action: 'sync_all',
      status: 'started',
      message: 'Starting sync for all products'
    });
    
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, kiosk_token, external_id')
      .not('kiosk_token', 'is', null)
      .limit(20); // Limit to prevent too many simultaneous requests
      
    if (fetchError) throw fetchError;
    
    if (!products || products.length === 0) {
      await createSyncLog({
        action: 'sync_all',
        status: 'success',
        message: 'No products with kiosk tokens found to sync'
      });
      return { productsUpdated: 0, message: 'No products with kiosk tokens found to sync' };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        if (product.external_id) {
          await syncProduct(product.external_id);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Error syncing product ${product.id}:`, error);
      }
    }
    
    await createSyncLog({
      action: 'sync_all',
      status: 'success',
      message: `Completed sync for all products. Success: ${successCount}, Errors: ${errorCount}`
    });
    
    return { 
      productsUpdated: successCount, 
      message: `Completed sync for all products. Success: ${successCount}, Errors: ${errorCount}` 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error syncing all products:', errorMessage);
    
    await createSyncLog({
      action: 'sync_all',
      status: 'error',
      message: `Error syncing all products: ${errorMessage}`
    });
    
    throw error;
  }
}

async function createSyncLog(logData: { 
  action: string; 
  status: string; 
  product_id?: string; 
  message?: string; 
}) {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert(logData);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating sync log:', error);
    // Don't throw here to prevent cascading errors
  }
}
