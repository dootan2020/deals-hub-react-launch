
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
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
    
    // Get API configuration
    const { data: apiConfigs, error: configError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1);
      
    if (configError || !apiConfigs || apiConfigs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: "false", 
          description: 'Không thể kết nối với máy chủ API. Vui lòng thử lại sau.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const apiConfig = apiConfigs[0];
    const userToken = apiConfig.user_token;
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Order API request:", body, "URL:", req.url);
    } catch (e) {
      return new Response(
        JSON.stringify({ success: "false", description: 'Invalid JSON body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const action = body?.action;
    
    // Process different actions
    switch (action) {
      case 'place-order': {
        const { kioskToken, quantity, promotionCode } = body;
        
        if (!kioskToken || !quantity) {
          return new Response(
            JSON.stringify({ success: "false", description: 'Missing required parameters' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Build the API URL
        let apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${kioskToken}&userToken=${userToken}&quantity=${quantity}`;
        if (promotionCode) {
          apiUrl += `&promotion=${promotionCode}`;
        }
        
        try {
          // Fetch proxy settings for the request
          const { data: proxySettings } = await supabase
            .from('proxy_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
          const proxyConfig = {
            type: proxySettings?.[0]?.proxy_type || 'allorigins',
            url: proxySettings?.[0]?.custom_url || undefined
          };
          
          console.log(`Calling purchase API: ${apiUrl} through proxy type: ${proxyConfig.type}`);
          
          const data = await fetchViaProxyWithFallback(apiUrl, proxyConfig);
          console.log("API Response:", data);
          
          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          console.error("Error calling purchase API:", error);
          return new Response(
            JSON.stringify({ success: "false", description: `Lỗi gọi API: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      case 'check-order': {
        const { orderId } = body;
        
        if (!orderId) {
          return new Response(
            JSON.stringify({ success: "false", description: 'Missing order ID' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Build the API URL
        const apiUrl = `https://taphoammo.net/api/getProducts?orderId=${orderId}&userToken=${userToken}`;
        
        try {
          // Fetch proxy settings for the request
          const { data: proxySettings } = await supabase
            .from('proxy_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
          const proxyConfig = {
            type: proxySettings?.[0]?.proxy_type || 'allorigins',
            url: proxySettings?.[0]?.custom_url || undefined
          };
          
          console.log(`Calling check order API: ${apiUrl} through proxy type: ${proxyConfig.type}`);
          
          const data = await fetchViaProxyWithFallback(apiUrl, proxyConfig);
          console.log("API Response:", data);
          
          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          console.error("Error calling check order API:", error);
          return new Response(
            JSON.stringify({ success: "false", description: `Lỗi gọi API: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      case 'get-stock': {
        const { kioskToken } = body;
        
        if (!kioskToken) {
          return new Response(
            JSON.stringify({ success: "false", description: 'Missing kiosk token' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Build the API URL
        const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}&userToken=${userToken}`;
        
        try {
          // Fetch proxy settings for the request
          const { data: proxySettings } = await supabase
            .from('proxy_settings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);
            
          const proxyConfig = {
            type: proxySettings?.[0]?.proxy_type || 'allorigins',
            url: proxySettings?.[0]?.custom_url || undefined
          };
          
          console.log(`Calling get stock API: ${apiUrl} through proxy type: ${proxyConfig.type}`);
          
          const data = await fetchViaProxyWithFallback(apiUrl, proxyConfig);
          console.log("API Response:", data);
          
          return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          console.error("Error calling get stock API:", error);
          return new Response(
            JSON.stringify({ success: "false", description: `Lỗi gọi API: ${error.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
      
      default:
        return new Response(
          JSON.stringify({ success: "false", description: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ success: "false", description: `Lỗi hệ thống: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
