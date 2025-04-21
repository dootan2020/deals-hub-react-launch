
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseRequest {
  userId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  kioskToken: string;
  promotionCode?: string;
}

interface TransactionResult {
  success: boolean;
  orderId?: string;
  message?: string;
  orderData?: any;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(JSON.stringify({ success: false, message: 'Server config missing', error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (req.method === 'POST') {
      let body: PurchaseRequest;
      try {
        body = await req.json();
      } catch (parseError) {
        console.error('Invalid POST body:', parseError);
        return new Response(JSON.stringify({ success: false, message: 'Invalid JSON body', error: String(parseError) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
      }
      const { userId, productId, quantity, totalAmount, kioskToken, promotionCode } = body;
      
      if (!userId || !productId || !quantity || !totalAmount || !kioskToken) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Missing required fields',
            error: 'userId, productId, quantity, totalAmount, or kioskToken missing'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Begin transaction
      try {
        // 1. Check user balance
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();
        
        if (profileError || !userProfile) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'User profile not found',
              error: profileError ? profileError.message : 'User not found'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        
        const userBalance = userProfile.balance || 0;
        
        if (userBalance < totalAmount) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Insufficient balance',
              error: 'Balance below required totalAmount'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // 2. Get API configuration
        const { data: apiConfigs, error: configError } = await supabase
          .from('api_configs')
          .select('*')
          .eq('is_active', true)
          .limit(1);
          
        if (configError || !apiConfigs || apiConfigs.length === 0) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No active API configuration found',
              error: configError ? configError.message : 'No config',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        const apiConfig = apiConfigs[0];
        
        // 3. Call the purchase API
        let apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${kioskToken}&userToken=${apiConfig.user_token}&quantity=${quantity}`;
        
        if (promotionCode) {
          apiUrl += `&promotion=${promotionCode}`;
        }
        
        console.log(`Calling purchase API: ${apiUrl}`);
        
        const options = {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Cache-Control': 'no-cache',
            'Referer': 'https://taphoammo.net/',
            'Origin': 'https://taphoammo.net',
            'Pragma': 'no-cache',
            'Connection': 'keep-alive',
            'X-Requested-With': 'XMLHttpRequest'
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
          console.log(`API response status: ${response.status}`);
          
          if (!response.ok) {
            throw new Error(`API error: Status ${response.status}`);
          }
          
          const responseText = await response.text();
          console.log(`API response raw (first 500 chars): ${responseText.substring(0, 500)}`);
          
          if (!responseText.trim()) {
            throw new Error('API returned empty response');
          }
          
          // Parse the response as JSON
          let orderResponse: any;
          try {
            orderResponse = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`Error parsing JSON response: ${parseError}`);
            throw new Error(`Failed to parse API response: ${parseError}`);
          }
          
          if (orderResponse.success !== 'true' || !orderResponse.order_id) {
            throw new Error(orderResponse.description || 'Failed to place order');
          }
          
          // 4. Deduct user balance
          const newBalance = userBalance - totalAmount;
          
          const { error: updateBalanceError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', userId);
          
          if (updateBalanceError) {
            throw new Error('Failed to update user balance');
          }
          
          // 5. Record transaction
          const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
              user_id: userId,
              amount: -totalAmount,
              type: 'purchase',
              description: `Purchase of ${quantity} x product`,
              status: 'completed',
              reference_id: orderResponse.order_id
            })
            .select()
            .single();
          
          if (transactionError) {
            console.error('Failed to record transaction:', transactionError);
          }
          
          // 6. Store order in database
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              external_order_id: orderResponse.order_id,
              status: 'processing',
              total_amount: totalAmount,
              promotion_code: promotionCode || null,
              user_id: userId
            })
            .select()
            .single();
            
          if (orderError) {
            console.error('Failed to store order:', orderError);
          } else {
            // Store order item
            await supabase
              .from('order_items')
              .insert({
                order_id: order.id,
                product_id: productId,
                quantity,
                price: totalAmount / quantity,
                external_product_id: kioskToken
              });
          }
          
          // 7. Wait for order processing
          let products = null;
          let retries = 0;
          const maxRetries = 5;
          const retryDelayMs = 1500;
          
          while (retries < maxRetries) {
            try {
              const checkResponse = await fetch(
                `https://taphoammo.net/api/getProducts?orderId=${orderResponse.order_id}&userToken=${apiConfig.user_token}`,
                { ...options }
              );
              
              if (!checkResponse.ok) {
                throw new Error(`Check API error: Status ${checkResponse.status}`);
              }
              
              const checkData = await checkResponse.json();
              
              if (checkData.success === 'true' && checkData.data) {
                products = checkData.data;
                
                // Update order status
                await supabase
                  .from('orders')
                  .update({ status: 'completed' })
                  .eq('id', order.id);
                  
                break;
              }
              
              // If order is still processing, wait and retry
              if (checkData.description === 'Order in processing!') {
                console.log(`Order ${orderResponse.order_id} still processing, retrying... (${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                retries++;
                continue;
              }
              
              // Any other error
              throw new Error(checkData.description || 'Unknown error while processing order');
            } catch (checkError) {
              if (retries >= maxRetries - 1) {
                throw checkError;
              }
              
              console.error(`Retry ${retries + 1}/${maxRetries} failed:`, checkError);
              await new Promise(resolve => setTimeout(resolve, retryDelayMs));
              retries++;
            }
          }
          
          // Return success with order details
          const result: TransactionResult = {
            success: true,
            orderId: orderResponse.order_id,
            message: 'Purchase completed successfully',
            orderData: products
          };
          
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          const isTimeout = fetchError?.name === 'AbortError';
          const errMsg = isTimeout ? 'API request timed out after 30 seconds' : String(fetchError?.message || fetchError);
          console.error('API fetch error:', errMsg);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: errMsg,
              error: errMsg
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      } catch (majorError: any) {
        console.error("Order handling failed:", majorError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: majorError?.message || String(majorError), 
            error: String(majorError)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error: any) {
    console.error('Uncaught error in process-purchase:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'An unknown error occurred',
        error: String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

