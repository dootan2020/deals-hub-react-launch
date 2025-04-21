
import { createRateLimitedFunction } from "../_shared/withRateLimiting.ts";

createRateLimitedFunction(
  async (req, supabase) => {
    try {
      const { email } = await req.json();
      
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      
      // Call Supabase resend verification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${new URL(req.url).origin}/auth/verify`,
        }
      });
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Verification email sent successfully"
        }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("Error resending verification email:", error);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to resend verification email",
          message: error.message 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
  {
    identifier: "auth:resend-verification",
    limit: 3,  // Only 3 attempts
    window: 300,  // in a 5-minute window
    debug: true
  }
);
