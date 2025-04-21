/**
 * Rate limiting middleware for Supabase Edge Functions
 * Uses Deno KV to track and limit requests by IP address
 */

interface RateLimitOptions {
  /** Maximum number of requests allowed per time window */
  limit: number;
  /** Time window in seconds */
  window: number;
  /** Identifier for this rate limit (e.g. 'auth', 'payment') */
  identifier: string;
  /** Whether to include console logs for tracking */
  debug?: boolean;
}

interface RateLimitInfo {
  /** Number of requests remaining for the current window */
  remaining: number;
  /** When the current rate limit window resets (timestamp) */
  reset: number;
  /** Whether the request is allowed or has exceeded the limit */
  allowed: boolean;
}

/**
 * Rate limiting middleware for Edge Functions
 */
export async function withRateLimit(
  req: Request,
  options: RateLimitOptions
): Promise<{info: RateLimitInfo; isRateLimited: boolean}> {
  const { limit, window: windowSeconds, identifier, debug = false } = options;
  
  // Get client IP address from request
  const clientIp = req.headers.get("x-forwarded-for") || 
    req.headers.get("x-real-ip") || 
    "127.0.0.1";
  
  // Create a unique key based on the IP and identifier
  const key = `ratelimit:${identifier}:${clientIp}`;
  
  if (debug) {
    console.log(`Rate limit check for ${key}`);
  }

  // Initialize Deno KV
  const kv = await Deno.openKv();
  
  // Current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  
  // Window expiration timestamp
  const windowExpires = now + windowSeconds;
  
  // Try to get the current count for this key
  const entry = await kv.get([key]);
  
  // If no entry exists or the entry has expired, create a new one
  if (!entry.value || (entry.value as any).expires <= now) {
    // This is the first request in a new window
    const newValue = {
      count: 1,
      expires: windowExpires,
    };
    
    // Set the new entry with expiration
    await kv.set([key], newValue, { expireIn: windowSeconds * 1000 });
    
    // Return rate limit information
    return {
      info: {
        remaining: limit - 1,
        reset: windowExpires,
        allowed: true
      },
      isRateLimited: false
    };
  }
  
  // Existing entry - increment the counter
  const value = entry.value as { count: number; expires: number };
  const currentCount = value.count;
  const expires = value.expires;
  
  // Check if limit is exceeded
  if (currentCount >= limit) {
    if (debug) {
      console.log(`Rate limit exceeded for ${key} (${currentCount}/${limit})`);
    }
    
    // Return rate limit exceeded information
    return {
      info: {
        remaining: 0,
        reset: expires,
        allowed: false
      },
      isRateLimited: true
    };
  }
  
  // Increment the counter
  const newCount = currentCount + 1;
  
  // Update the counter in KV store
  await kv.set([key], { count: newCount, expires }, { expireIn: (expires - now) * 1000 });
  
  if (debug) {
    console.log(`Request allowed for ${key} (${newCount}/${limit})`);
  }
  
  // Return updated rate limit information
  return {
    info: {
      remaining: limit - newCount,
      reset: expires,
      allowed: true
    },
    isRateLimited: false
  };
}

/**
 * Creates a standard response for rate limited requests
 */
export function createRateLimitResponse(info: RateLimitInfo, corsHeaders: Record<string, string> = {}) {
  const secondsToReset = Math.max(0, info.reset - Math.floor(Date.now() / 1000));
  
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Try again in ${secondsToReset} seconds.`,
      retryAfter: secondsToReset
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": info.remaining.toString(),
        "X-RateLimit-Reset": info.reset.toString(),
        "Retry-After": secondsToReset.toString(),
        ...corsHeaders
      }
    }
  );
}

/**
 * Logs rate limit information to Supabase
 */
export async function logRateLimitEvent(
  supabase: any,
  info: {
    ip: string;
    path: string;
    identifier: string;
    allowed: boolean;
    remainingAttempts: number;
  }
) {
  try {
    await supabase.from("security_logs").insert({
      event_type: "rate_limit",
      ip_address: info.ip,
      endpoint: info.path,
      identifier: info.identifier,
      allowed: info.allowed,
      remaining_attempts: info.remainingAttempts,
      metadata: info
    });
  } catch (error) {
    console.error("Failed to log rate limit event:", error);
  }
}
