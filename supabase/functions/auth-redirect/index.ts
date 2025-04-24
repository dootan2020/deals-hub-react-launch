
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Supabase client trong edge function, sử dụng service role cho quyền cao hơn
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

// CORS headers cần thiết
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Xử lý CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const redirectTo = url.searchParams.get("redirect") || "https://acczen.net/auth/verified";
    
    console.log("Auth redirect handler running");
    console.log("Token received:", token ? "***" + token.substring(token.length - 5) : "null");
    console.log("Redirect URL:", redirectTo);
    
    if (!token) {
      console.error("No token provided");
      return new Response(
        JSON.stringify({ error: "Missing token parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Xác thực token bằng Supabase Admin client
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });
    
    if (error) {
      console.error("Token verification failed:", error);
      
      // Tạo URL lỗi với thông tin để hiển thị cho người dùng
      const errorUrl = new URL(redirectTo);
      errorUrl.searchParams.append("error", error.message);
      errorUrl.searchParams.append("status", String(error.status || 400));
      
      // Chuyển hướng đến trang lỗi
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: errorUrl.toString(),
        },
      });
    }
    
    console.log("Token verification successful, user:", data?.user?.id || "unknown");
    
    // Tạo URL thành công với thông tin session nếu có
    const successUrl = new URL(redirectTo);
    if (data?.session) {
      successUrl.searchParams.append("success", "true");
    }
    
    // Chuyển hướng đến trang thành công
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: successUrl.toString(),
      },
    });
  } catch (err) {
    console.error("Unexpected error in auth-redirect:", err);
    
    return new Response(
      JSON.stringify({ error: "Server error processing authentication" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
