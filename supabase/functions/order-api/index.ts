
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
    
    // Log the API request
    console.log(`Order API request: ${action}, URL: ${url.toString()}`);
    
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
        
        // Get product kiosk token
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('kiosk_token, price')
          .eq('id', productId)
          .limit(1);
          
        if (productError || !product || product.length === 0 || !product[0].kiosk_token) {
          return new Response(
            JSON.stringify({ error: 'Product not found or has no kiosk token' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        
        const kioskToken = product[0].kiosk_token;
        
        // Call the purchase API
        let apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${kioskToken}&userToken=${apiConfig.user_token}&quantity=${quantity}`;
        
        if (promotionCode) {
          apiUrl += `&promotion=${promotionCode}`;
        }
        
        console.log(`Calling purchase API: ${apiUrl}`);
        
        const options = {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Referer': 'https://taphoammo.net/',
            'Origin': 'https://taphoammo.net',
            'Pragma': 'no-cache'
          },
          redirect: 'follow'
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(apiUrl, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const statusCode = response.status;
            let errorText = '';
            
            try {
              errorText = await response.text();
              console.error(`API error response: ${errorText.substring(0, 500)}`);
            } catch (e) {
              errorText = 'Unable to read error response';
            }
            
            // Check if response is HTML
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.includes('<html')) {
              return new Response(
                JSON.stringify({ error: 'API returned HTML instead of JSON. Please check your configuration.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            return new Response(
              JSON.stringify({ error: `API error: Status ${statusCode}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
            );
          }
          
          const responseText = await response.text();
          console.log(`API response raw: ${responseText.substring(0, 500)}`);
          
          if (!responseText.trim()) {
            return new Response(
              JSON.stringify({ error: 'API returned empty response' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // Check if response is HTML instead of JSON
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html')) {
            return new Response(
              JSON.stringify({ error: 'API returned HTML instead of JSON. Please check your configuration.' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // Parse the response as JSON
          const orderResponse: OrderResponse = JSON.parse(responseText);
          
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
                external_product_id: kioskToken
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
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            return new Response(
              JSON.stringify({ error: 'API request timed out after 30 seconds' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 504 }
            );
          }
          
          throw fetchError;
        }
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
        console.log(`Checking order status: ${apiUrl}`);
        
        const options = {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Referer': 'https://taphoammo.net/',
            'Origin': 'https://taphoammo.net',
            'Pragma': 'no-cache'
          },
          redirect: 'follow'
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(apiUrl, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const statusCode = response.status;
            let errorText = '';
            
            try {
              errorText = await response.text();
              console.error(`API error response for order check: ${errorText.substring(0, 500)}`);
            } catch (e) {
              errorText = 'Unable to read error response';
            }
            
            // Check if response is HTML
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.includes('<html')) {
              return new Response(
                JSON.stringify({ error: 'API returned HTML instead of JSON. Please check your configuration.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            return new Response(
              JSON.stringify({ error: `API error: Status ${statusCode}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
            );
          }
          
          const responseText = await response.text();
          console.log(`Order check API response raw: ${responseText.substring(0, 500)}`);
          
          if (!responseText.trim()) {
            return new Response(
              JSON.stringify({ error: 'API returned empty response' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // Check if response is HTML instead of JSON
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html')) {
            return new Response(
              JSON.stringify({ error: 'API returned HTML instead of JSON. Please check your configuration.' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // Parse the response as JSON
          const productResponse: ProductResponse = JSON.parse(responseText);
          
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
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            return new Response(
              JSON.stringify({ error: 'API request timed out after 30 seconds' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 504 }
            );
          }
          
          throw fetchError;
        }
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
