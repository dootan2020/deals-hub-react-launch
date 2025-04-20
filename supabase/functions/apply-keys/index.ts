
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { fetchViaProxyWithFallback } from "../_shared/proxyUtils.ts";

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
    
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing order ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get order details
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        order_items (
          product_id,
          quantity,
          external_product_id
        )
      `)
      .eq('id', orderId)
      .single();
      
    if (orderError || !orderData) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Check if order is already processed
    if (orderData.status === 'completed') {
      return new Response(
        JSON.stringify({ success: false, message: 'Order already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get API configuration
    const { data: apiConfig } = await supabase
      .from('api_configs')
      .select('user_token')
      .eq('is_active', true)
      .limit(1)
      .single();
      
    if (!apiConfig?.user_token) {
      return new Response(
        JSON.stringify({ success: false, message: 'API configuration not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get proxy settings
    const { data: proxySettings } = await supabase
      .from('proxy_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
      
    const proxyConfig = {
      type: proxySettings?.[0]?.proxy_type || 'allorigins',
      url: proxySettings?.[0]?.custom_url || undefined
    };
    
    // Process each order item
    for (const item of orderData.order_items) {
      if (!item.external_product_id) continue;
      
      // Call TapHoaMMO API to get keys
      const apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${item.external_product_id}&userToken=${apiConfig.user_token}&quantity=${item.quantity}`;
      
      try {
        const response = await fetchViaProxyWithFallback(apiUrl, proxyConfig);
        
        if (response.success === "true" && response.product) {
          // Store keys in database
          const keys = Array.isArray(response.product) ? response.product : [response.product];
          
          for (const key of keys) {
            await supabase.from('product_keys').insert({
              order_id: orderId,
              product_id: item.product_id,
              key_content: key,
              status: 'active'
            });
          }
        } else {
          throw new Error(response.description || 'Failed to get product keys');
        }
      } catch (error) {
        console.error('Error processing product:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error processing product: ${error.message}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // Update order status to completed
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Keys applied successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ success: false, message: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
