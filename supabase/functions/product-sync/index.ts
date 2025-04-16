
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiConfig {
  id: string;
  name: string;
  user_token: string;
}

interface ProductInfo {
  success: string;
  name?: string;
  stock?: string;
  price?: string;
  description?: string;
  data?: Array<{product: string}>;
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
    const kioskToken = url.searchParams.get('kioskToken');
    const userToken = url.searchParams.get('userToken');
    
    console.log(`Request received: action=${action}, kioskToken=${kioskToken?.substring(0, 8)}..., userToken=${userToken?.substring(0, 8)}...`);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get active API configuration if not provided directly
    let apiConfig: ApiConfig | null = null;
    if (!userToken) {
      const { data: apiConfigs, error: configError } = await supabase
        .from('api_configs')
        .select('*')
        .eq('is_active', true)
        .limit(1);
        
      if (configError || !apiConfigs || apiConfigs.length === 0) {
        throw new Error('No active API configuration found');
      }
      
      apiConfig = apiConfigs[0] as ApiConfig;
    }
    
    const finalUserToken = userToken || (apiConfig ? apiConfig.user_token : null);
    
    if (!finalUserToken) {
      throw new Error('User token is required');
    }
    
    console.log(`Using user token: ${finalUserToken.substring(0, 8)}... for action: ${action}`);
    
    switch (action) {
      case 'check':
        return await handleCheckStock(req, supabase, kioskToken, finalUserToken);
      case 'sync-all':
        return await handleSyncAll(req, supabase, finalUserToken);
      case 'sync-product':
        if (!kioskToken && !externalId) {
          return new Response(
            JSON.stringify({ error: 'External ID or Kiosk Token is required for product sync' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        return await handleSyncProduct(req, supabase, finalUserToken, externalId, kioskToken);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handle checking stock for a specific product or all products
async function handleCheckStock(req: Request, supabase: any, kioskToken: string | null, userToken: string): Promise<Response> {
  const url = new URL(req.url);
  const externalId = url.searchParams.get('externalId');
  
  try {
    if (kioskToken) {
      // Check specific product by kioskToken (direct API call)
      console.log(`Fetching product info for kioskToken: ${kioskToken.substring(0, 8)}... with userToken: ${userToken.substring(0, 8)}...`);
      const productInfo = await fetchProductInfoByKioskToken(userToken, kioskToken);
      console.log('API response:', productInfo);
      
      // Log the check
      await logSyncAction(supabase, null, 'check', 
        productInfo.success === 'true' ? 'success' : 'error',
        productInfo.success === 'true' ? 
          `Product info fetched: ${productInfo.name || ''}, Stock: ${productInfo.stock || ''}, Price: ${productInfo.price || ''}` : 
          `Failed to fetch product info: ${JSON.stringify(productInfo)}`
      );
      
      return new Response(
        JSON.stringify(productInfo),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (externalId) {
      // Check specific product by externalId
      // First, look up the product in the database to get its kioskToken
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('kiosk_token')
        .eq('external_id', externalId)
        .single();
        
      if (productError || !product || !product.kiosk_token) {
        throw new Error('Product not found or has no kiosk token');
      }
      
      const productInfo = await fetchProductInfoByKioskToken(userToken, product.kiosk_token);
      
      // Log the check
      await logSyncAction(supabase, null, 'check', 
        productInfo.success === 'true' ? 'success' : 'error',
        productInfo.success === 'true' ? 
          `Product info fetched: ${productInfo.name || ''}, Stock: ${productInfo.stock || ''}, Price: ${productInfo.price || ''}` : 
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
        .select('id, external_id, kiosk_token')
        .not('kiosk_token', 'is', null);
        
      if (productsError || !products) {
        throw new Error(`Failed to fetch products: ${productsError?.message}`);
      }
      
      const results: Record<string, ProductInfo> = {};
      
      for (const product of products) {
        if (product.kiosk_token) {
          results[product.kiosk_token] = await fetchProductInfoByKioskToken(userToken, product.kiosk_token);
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
  } catch (error: any) {
    console.error('Check stock error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Handle syncing all products
async function handleSyncAll(req: Request, supabase: any, userToken: string): Promise<Response> {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, external_id, kiosk_token')
      .not('kiosk_token', 'is', null);
      
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
      if (product.kiosk_token) {
        try {
          const updated = await syncProductByKioskToken(supabase, userToken, product.kiosk_token, product.id);
          if (updated) {
            result.productsUpdated++;
          }
        } catch (error: any) {
          result.errors.push(`Error syncing product ${product.kiosk_token}: ${error.message}`);
        }
      }
    }
    
    result.message = `Synced ${result.productsUpdated} products with ${result.errors.length} errors`;
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
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
  userToken: string,
  externalId: string | null,
  kioskToken: string | null
): Promise<Response> {
  try {
    let productId: string;
    
    if (kioskToken) {
      // If we have kioskToken, find product by it
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('kiosk_token', kioskToken)
        .limit(1);
        
      if (productError || !products || products.length === 0) {
        return new Response(
          JSON.stringify({ error: `Product with kiosk token ${kioskToken} not found` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      productId = products[0].id;
      const updated = await syncProductByKioskToken(supabase, userToken, kioskToken, productId);
      
      return new Response(
        JSON.stringify({
          success: true,
          updated: updated,
          message: updated ? 'Product updated successfully' : 'No updates needed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (externalId) {
      // If we have externalId, find product by it and get its kioskToken
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, kiosk_token')
        .eq('external_id', externalId)
        .limit(1);
        
      if (productError || !product || product.length === 0) {
        return new Response(
          JSON.stringify({ error: `Product with external ID ${externalId} not found` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      if (!product[0].kiosk_token) {
        return new Response(
          JSON.stringify({ error: `Product with external ID ${externalId} has no kiosk token` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      productId = product[0].id;
      const updated = await syncProductByKioskToken(supabase, userToken, product[0].kiosk_token, productId);
      
      return new Response(
        JSON.stringify({
          success: true,
          updated: updated,
          message: updated ? 'Product updated successfully' : 'No updates needed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Either kiosk token or external ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Sync product error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Fetch product info from API by kioskToken
async function fetchProductInfoByKioskToken(userToken: string, kioskToken: string): Promise<ProductInfo> {
  // Direct API URL to TapHoaMMO
  const targetUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}&userToken=${userToken}`;
  
  try {
    console.log(`Fetching product info from: ${targetUrl}`);
    
    // Enhanced headers for improved compatibility
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // Add a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Use Deno's fetch API to directly call the TapHoaMMO API
      const response = await fetch(targetUrl, { 
        headers, 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const statusCode = response.status;
        let errorText = '';
        
        try {
          errorText = await response.text();
          console.error(`API error response (${statusCode}): ${errorText.substring(0, 300)}`);
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        // Check if response is HTML
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          console.error(`API returned HTML response instead of JSON. Status: ${statusCode}`);
          return { 
            success: 'false', 
            description: `API error: Received HTML instead of JSON. Status: ${statusCode}. Please verify your API credentials.` 
          };
        }
        
        return { 
          success: 'false', 
          description: `API error: Status ${statusCode}. ${errorText}` 
        };
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      const responseText = await response.text();
      console.log(`API raw response (first 300 chars): ${responseText.substring(0, 300)}`);
      
      // Check for HTML content
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('Received HTML instead of JSON');
        return { 
          success: 'false', 
          description: 'API returned HTML instead of JSON. Please verify your API credentials.' 
        };
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed API response:', data);
        return data;
      } catch (parseError) {
        console.error(`Error parsing JSON response: ${parseError}`);
        return { 
          success: 'false', 
          description: `Invalid JSON response: ${responseText.substring(0, 100)}...` 
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('API request timed out after 15 seconds');
        return { 
          success: 'false', 
          description: 'API request timed out after 15 seconds. Server may be slow or unresponsive.' 
        };
      }
      
      console.error(`Fetch error: ${fetchError.message}`);
      
      // If the direct call fails, return a fallback error
      return { 
        success: 'false', 
        description: `API error: ${fetchError.message}` 
      };
    }
  } catch (error: any) {
    console.error(`Error fetching product info: ${error.message}`);
    return { 
      success: 'false', 
      description: `API error: ${error.message}` 
    };
  }
}

// Sync product data from API to database using kioskToken
async function syncProductByKioskToken(
  supabase: any, 
  userToken: string, 
  kioskToken: string, 
  productId: string
): Promise<boolean> {
  try {
    // Fetch latest product info
    const productInfo = await fetchProductInfoByKioskToken(userToken, kioskToken);
    
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
      `Product updated: Name: ${productInfo.name || ''}, Stock: ${productInfo.stock || ''}, Price: ${productInfo.price || ''}`
    );
    
    return true;
  } catch (error: any) {
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
  } catch (error: any) {
    console.error(`Failed to log sync action: ${error.message}`);
  }
}
