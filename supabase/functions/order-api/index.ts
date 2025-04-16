
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderResponse {
  success: string;
  order_id?: string;
  description?: string;
}

interface ProductResponse {
  success: string;
  data?: { product: string }[];
  description?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
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
    
    const apiConfig = apiConfigs[0];
    
    if (req.method === 'POST') {
      if (action === 'place-order') {
        const body = await req.json();
        const { quantity, productId, promotionCode } = body;
        
        if (!quantity || !productId) {
          return new Response(
            JSON.stringify({ error: 'Quantity and productId are required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Get product external ID
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('external_id, price')
          .eq('id', productId)
          .limit(1);
          
        if (productError || !product || product.length === 0 || !product[0].external_id) {
          return new Response(
            JSON.stringify({ error: 'Product not found or has no external ID' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        
        const externalId = product[0].external_id;
        
        // Call the purchase API
        let apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${apiConfig.kiosk_token}&userToken=${apiConfig.user_token}&quantity=${quantity}`;
        
        if (promotionCode) {
          apiUrl += `&promotion=${promotionCode}`;
        }
        
        const response = await fetch(apiUrl);
        const orderResponse: OrderResponse = await response.json();
        
        if (orderResponse.success !== 'true') {
          return new Response(
            JSON.stringify({ error: orderResponse.description || 'Failed to place order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Store order in database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            external_order_id: orderResponse.order_id,
            status: 'processing',
            total_amount: product[0].price * quantity,
            promotion_code: promotionCode || null
          })
          .select()
          .limit(1);
          
        if (orderError || !order || order.length === 0) {
          console.error('Failed to store order:', orderError);
        } else {
          // Store order item
          await supabase
            .from('order_items')
            .insert({
              order_id: order[0].id,
              product_id: productId,
              quantity,
              price: product[0].price,
              external_product_id: externalId
            });
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            orderId: orderResponse.order_id,
            message: 'Order placed successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (action === 'check-order') {
        const body = await req.json();
        const { orderId } = body;
        
        if (!orderId) {
          return new Response(
            JSON.stringify({ error: 'Order ID is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Call the get products API
        const apiUrl = `https://taphoammo.net/api/getProducts?orderId=${orderId}&userToken=${apiConfig.user_token}`;
        
        const response = await fetch(apiUrl);
        const productResponse: ProductResponse = await response.json();
        
        // Update order status if successful
        if (productResponse.success === 'true' && productResponse.data) {
          // Get order from database
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('id')
            .eq('external_order_id', orderId)
            .limit(1);
            
          if (!orderError && orders && orders.length > 0) {
            await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('id', orders[0].id);
          }
        }
        
        return new Response(
          JSON.stringify(productResponse),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
