
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Supabase client with service role for higher privileges
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "https://xcpwyvrlutlslgaueokd.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Required CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, you should restrict this to your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const url = new URL(req.url);
    
    // Support both token and token_hash parameters (token_hash is the parameter name Supabase uses)
    const token = url.searchParams.get("token") || url.searchParams.get("token_hash") || url.searchParams.get("type");
    const type = url.searchParams.get("type") || "email";
    const redirectTo = url.searchParams.get("redirect") || "https://acczen.net/auth/verified";
    
    console.log("[auth-redirect] Function running");
    console.log("[auth-redirect] Parameters received:", Object.fromEntries(url.searchParams));
    console.log("[auth-redirect] Token received:", token ? "***" + token.substring(token.length - 5) : "null");
    console.log("[auth-redirect] Token type:", type);
    console.log("[auth-redirect] Redirect URL:", redirectTo);
    
    if (!token) {
      console.error("[auth-redirect] No token provided");
      return new Response(
        JSON.stringify({ error: "Missing token parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Verify the token using Supabase Admin client
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: type,
    });
    
    if (error) {
      console.error("[auth-redirect] Token verification failed:", error);
      console.error("[auth-redirect] Error code:", error.status);
      console.error("[auth-redirect] Error message:", error.message);
      
      // Create error URL with information to display to the user
      const errorUrl = new URL(redirectTo);
      errorUrl.searchParams.append("error", error.message);
      errorUrl.searchParams.append("status", String(error.status || 400));
      
      // Redirect to the error page
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: errorUrl.toString(),
        },
      });
    }
    
    console.log("[auth-redirect] Token verification successful");
    console.log("[auth-redirect] User ID:", data?.user?.id || "unknown");
    
    // Create success URL with session information if available
    const successUrl = new URL(redirectTo);
    successUrl.searchParams.append("success", "true");
    
    // Redirect to the success page
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: successUrl.toString(),
      },
    });
  } catch (err) {
    console.error("[auth-redirect] Unexpected error:", err);
    
    return new Response(
      JSON.stringify({ error: "Server error processing authentication" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
