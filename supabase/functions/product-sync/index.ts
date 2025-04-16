
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiConfig {
  id: string;
  name: string;
  kiosk_token: string;
  user_token: string;
}

interface ProductInfo {
  success: string;
  name?: string;
  stock?: string;
  price?: string;
  description?: string;
}

interface SyncResult {
  success: boolean;
  productsUpdated: number;
  errors: string[];
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'check';
    const externalId = url.searchParams.get('externalId');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get active API configuration
    const { data: apiConfigs, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1);
      
    if (configError || !apiConfigs || apiConfigs.length === 0) {
      throw new Error('No active API configuration found');
    }
    
    const apiConfig = apiConfigs[0] as ApiConfig;
    
    switch (action) {
      case 'check':
        return await handleCheckStock(req, supabase, apiConfig);
      case 'sync-all':
        return await handleSyncAll(req, supabase, apiConfig);
      case 'sync-product':
        if (!externalId) {
          return new Response(
            JSON.stringify({ error: 'External ID is required for product sync' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        return await handleSyncProduct(req, supabase, apiConfig, externalId);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handle checking stock for a specific product or all products
async function handleCheckStock(req: Request, supabase: any, apiConfig: ApiConfig): Promise<Response> {
  const url = new URL(req.url);
  const externalId = url.searchParams.get('externalId');
  
  try {
    if (externalId) {
      // Check specific product
      const productInfo = await fetchProductInfo(apiConfig, externalId);
      
      // Log the check
      await logSyncAction(supabase, null, 'check', 
        productInfo.success === 'true' ? 'success' : 'error',
        productInfo.success === 'true' ? 
          `Product info fetched: ${productInfo.name}, Stock: ${productInfo.stock}, Price: ${productInfo.price}` : 
          `Failed to fetch product info: ${JSON.stringify(productInfo)}`
      );
      
      return new Response(
        JSON.stringify(productInfo),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Check all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, external_id')
        .not('external_id', 'is', null);
        
      if (productsError || !products) {
        throw new Error(`Failed to fetch products: ${productsError?.message}`);
      }
      
      const results: Record<string, ProductInfo> = {};
      
      for (const product of products) {
        if (product.external_id) {
          results[product.external_id] = await fetchProductInfo(apiConfig, product.external_id);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Checked ${products.length} products`,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Check stock error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Handle syncing all products
async function handleSyncAll(req: Request, supabase: any, apiConfig: ApiConfig): Promise<Response> {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, external_id')
      .not('external_id', 'is', null);
      
    if (productsError || !products) {
      throw new Error(`Failed to fetch products: ${productsError?.message}`);
    }
    
    const result: SyncResult = {
      success: true,
      productsUpdated: 0,
      errors: [],
      message: ''
    };
    
    for (const product of products) {
      if (product.external_id) {
        try {
          const updated = await syncProduct(supabase, apiConfig, product.external_id, product.id);
          if (updated) {
            result.productsUpdated++;
          }
        } catch (error) {
          result.errors.push(`Error syncing product ${product.external_id}: ${error.message}`);
        }
      }
    }
    
    result.message = `Synced ${result.productsUpdated} products with ${result.errors.length} errors`;
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync all error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Handle syncing a specific product
async function handleSyncProduct(
  req: Request, 
  supabase: any, 
  apiConfig: ApiConfig, 
  externalId: string
): Promise<Response> {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('external_id', externalId)
      .limit(1);
      
    if (productError) {
      throw new Error(`Failed to fetch product: ${productError.message}`);
    }
    
    // If product doesn't exist, return error
    if (!product || product.length === 0) {
      return new Response(
        JSON.stringify({ error: `Product with external ID ${externalId} not found` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    const updated = await syncProduct(supabase, apiConfig, externalId, product[0].id);
    
    return new Response(
      JSON.stringify({
        success: true,
        updated: updated,
        message: updated ? 'Product updated successfully' : 'No updates needed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync product error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Fetch product info from API
async function fetchProductInfo(apiConfig: ApiConfig, externalId: string): Promise<ProductInfo> {
  const url = `https://taphoammo.net/api/getStock?kioskToken=${apiConfig.kiosk_token}&userToken=${apiConfig.user_token}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data as ProductInfo;
  } catch (error) {
    console.error(`Error fetching product info: ${error.message}`);
    return { success: 'false', description: `API error: ${error.message}` };
  }
}

// Sync product data from API to database
async function syncProduct(
  supabase: any, 
  apiConfig: ApiConfig, 
  externalId: string, 
  productId: string
): Promise<boolean> {
  try {
    // Fetch latest product info
    const productInfo = await fetchProductInfo(apiConfig, externalId);
    
    if (productInfo.success !== 'true') {
      await logSyncAction(
        supabase, 
        productId, 
        'sync', 
        'error', 
        `Failed to fetch product info: ${JSON.stringify(productInfo)}`
      );
      return false;
    }
    
    // Update product in database
    const { error: updateError } = await supabase
      .from('products')
      .update({
        api_name: productInfo.name,
        api_stock: parseInt(productInfo.stock || '0', 10),
        api_price: parseFloat(productInfo.price || '0'),
        in_stock: parseInt(productInfo.stock || '0', 10) > 0,
        last_synced_at: new Date().toISOString()
      })
      .eq('id', productId);
      
    if (updateError) {
      await logSyncAction(
        supabase, 
        productId, 
        'sync', 
        'error', 
        `Failed to update product: ${updateError.message}`
      );
      return false;
    }
    
    await logSyncAction(
      supabase, 
      productId, 
      'sync', 
      'success', 
      `Product updated: Name: ${productInfo.name}, Stock: ${productInfo.stock}, Price: ${productInfo.price}`
    );
    
    return true;
  } catch (error) {
    await logSyncAction(
      supabase,
      productId,
      'sync',
      'error',
      `Sync error: ${error.message}`
    );
    throw error;
  }
}

// Log sync action
async function logSyncAction(
  supabase: any,
  productId: string | null,
  action: string,
  status: string,
  message: string
): Promise<void> {
  try {
    await supabase
      .from('sync_logs')
      .insert({
        product_id: productId,
        action,
        status,
        message
      });
  } catch (error) {
    console.error(`Failed to log sync action: ${error.message}`);
  }
}
