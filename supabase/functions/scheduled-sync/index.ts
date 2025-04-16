
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Call the product-sync function to sync all products
    const syncUrl = `${supabaseUrl}/functions/v1/product-sync?action=sync-all`;
    
    console.log(`Starting scheduled sync at ${new Date().toISOString()}`);
    
    const response = await fetch(syncUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json"
      }
    });
    
    const result = await response.json();
    console.log(`Sync result: ${JSON.stringify(result)}`);
    
    // Check for products that are out of stock or low stock
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select('id, title, api_stock')
      .lt('api_stock', 10)
      .eq('in_stock', true);
      
    if (stockError) {
      console.error('Error checking low stock products:', stockError);
    } else if (lowStockProducts && lowStockProducts.length > 0) {
      console.log(`Found ${lowStockProducts.length} products with low stock`);
      
      // Log the low stock alert
      for (const product of lowStockProducts) {
        await supabase
          .from('sync_logs')
          .insert({
            product_id: product.id,
            action: 'low-stock-alert',
            status: 'warning',
            message: `Low stock alert: ${product.title} has only ${product.api_stock} items remaining`
          });
      }
    }
    
    // Log the scheduled sync
    await supabase
      .from('sync_logs')
      .insert({
        action: 'scheduled-sync',
        status: result.success ? 'success' : 'error',
        message: result.message || `Scheduled sync completed: ${result.productsUpdated} products updated`
      });
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Scheduled sync error:', error);
    
    // Create Supabase client for logging error
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log the error
    await supabase
      .from('sync_logs')
      .insert({
        action: 'scheduled-sync',
        status: 'error',
        message: `Scheduled sync error: ${error.message}`
      });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
