
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();

    // We need to use auth.users directly since we're using service role
    // Find unconfirmed users older than 24 hours
    const { data: usersToDelete, error: fetchError } = await supabase
      .from("auth.users")
      .select("id, created_at, email_confirmed_at")
      .is("email_confirmed_at", null)
      .lt("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${usersToDelete?.length || 0} unconfirmed accounts older than 24 hours`);

    let deletedCount = 0;
    if (usersToDelete && usersToDelete.length > 0) {
      // Delete each user
      for (const user of usersToDelete) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`Error deleting user ${user.id}:`, deleteError);
        } else {
          console.log(`Successfully deleted unconfirmed user ${user.id}`);
          deletedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed. Deleted ${deletedCount} unconfirmed accounts.`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in auth-cleanup function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 500,
      }
    );
  }
});
