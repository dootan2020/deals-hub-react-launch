
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { withRateLimit, createRateLimitResponse, logRateLimitEvent } from "./rateLimit.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Wraps an edge function handler with rate limiting
 */
export function withRateLimiting(handler: (req: Request, supabase: any) => Promise<Response>, options: {
  limit?: number;
  window?: number;
  identifier: string;
  enforceRateLimit?: boolean;
  debug?: boolean;
}) {
  const {
    limit = 10,
    window = 60,
    identifier,
    enforceRateLimit = true,
    debug = false
  } = options;
  
  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        throw new Error('Server configuration error');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Apply rate limiting
      const { info, isRateLimited } = await withRateLimit(req, {
        limit,
        window, 
        identifier,
        debug
      });
      
      // Get client IP for logging
      const clientIp = req.headers.get("x-forwarded-for") || 
        req.headers.get("x-real-ip") || 
        "127.0.0.1";
        
      // Get request path for logging
      const url = new URL(req.url);
      const path = url.pathname;
      
      // Log the rate limit check
      if (debug || isRateLimited) {
        await logRateLimitEvent(supabase, {
          ip: clientIp,
          path,
          identifier,
          allowed: !isRateLimited,
          remainingAttempts: info.remaining
        });
      }
      
      // If rate limited and enforcement is enabled, return 429 response
      if (isRateLimited && enforceRateLimit) {
        return createRateLimitResponse(info, corsHeaders);
      }
      
      // Add rate limit headers to the response
      const originalResponse = await handler(req, supabase);
      
      // Clone the response to add our custom headers
      const newHeaders = new Headers(originalResponse.headers);
      newHeaders.set("X-RateLimit-Limit", limit.toString());
      newHeaders.set("X-RateLimit-Remaining", info.remaining.toString());
      newHeaders.set("X-RateLimit-Reset", info.reset.toString());
      
      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      return new Response(originalResponse.body, {
        status: originalResponse.status,
        statusText: originalResponse.statusText,
        headers: newHeaders
      });
    } catch (error) {
      console.error(`Error in rate-limited function (${identifier}):`, error);
      
      return new Response(
        JSON.stringify({ error: "Internal Server Error", message: String(error) }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }
  };
}

/**
 * Create and serve a rate-limited edge function
 * @example
 * // Usage:
 * createRateLimitedFunction(
 *   async (req, supabase) => {
 *     // Your function logic here
 *     return new Response("OK");
 *   },
 *   { identifier: "auth:login", limit: 5, window: 60 }
 * );
 */
export function createRateLimitedFunction(
  handler: (req: Request, supabase: any) => Promise<Response>,
  options: {
    limit?: number;
    window?: number;
    identifier: string;
    enforceRateLimit?: boolean;
    debug?: boolean;
  }
) {
  serve(withRateLimiting(handler, options));
}
