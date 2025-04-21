
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface DepositRetryOptions {
  maxAttempts?: number;
  maxAgeMins?: number;
  limitPerRun?: number;
}

/**
 * Process pending deposits that need retrying
 */
async function retryPendingDeposits(options: DepositRetryOptions = {}): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  error?: string;
  depositIds?: string[];
}> {
  try {
    console.log("Starting to retry pending deposits");
    
    // Set defaults
    const maxAttempts = options.maxAttempts || 5;
    const maxAgeMins = options.maxAgeMins || 60; // 1 hour
    const limitPerRun = options.limitPerRun || 10;
    
    // Find pending deposits that:
    // 1. Have a transaction_id but are not processed
    // 2. Or are pending and older than 5 minutes
    // 3. Have not exceeded max attempts
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('id, transaction_id, user_id, amount, net_amount, status, process_attempts')
      .or(`and(transaction_id.is.not.null,is_processed.eq.false),and(status.eq.pending,created_at.lt.${new Date(Date.now() - 5 * 60 * 1000).toISOString()})`)
      .lt('process_attempts', maxAttempts)
      .gt('created_at', new Date(Date.now() - maxAgeMins * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(limitPerRun);

    if (error) {
      console.error("Error fetching pending deposits for retry:", error);
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message,
      };
    }

    if (!deposits || deposits.length === 0) {
      console.log("No pending deposits found for retry");
      return {
        success: true,
        processed: 0,
        failed: 0,
      };
    }

    console.log(`Found ${deposits.length} pending deposits to retry`);
    let processed = 0;
    let failed = 0;
    const processedIds: string[] = [];

    // Process each deposit
    for (const deposit of deposits) {
      try {
        if (deposit.transaction_id) {
          // If we have a transaction ID, call the webhook processor
          console.log(`Retrying deposit ${deposit.id} with transaction ${deposit.transaction_id}`);
          
          const response = await fetch(
            `${supabaseUrl}/functions/v1/paypal-webhook/process-specific`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transaction_id: deposit.transaction_id
              }),
            }
          );
          
          const result = await response.json();
          
          if (result.success) {
            processed++;
            processedIds.push(deposit.id);
            console.log(`Successfully retried deposit ${deposit.id}`);
          } else {
            failed++;
            console.error(`Failed to retry deposit ${deposit.id}:`, result.error || result.message);
          }
        } else {
          // For deposits without transaction_id, try to locate by order info or mark as stale
          console.log(`Deposit ${deposit.id} has no transaction ID, checking age`);
          
          // Calculate age in minutes
          const createdAt = new Date(deposit.created_at);
          const ageMinutes = (Date.now() - createdAt.getTime()) / (60 * 1000);
          
          // If older than 30 minutes, mark as failed
          if (ageMinutes > 30) {
            console.log(`Deposit ${deposit.id} is ${Math.round(ageMinutes)}m old with no transaction ID, marking as failed`);
            
            const { error: updateError } = await supabase
              .from('deposits')
              .update({
                status: 'failed',
                is_processed: true,
                process_attempts: (deposit.process_attempts || 0) + 1,
                last_attempt_at: new Date().toISOString()
              })
              .eq('id', deposit.id);
              
            if (updateError) {
              console.error(`Error marking deposit ${deposit.id} as failed:`, updateError);
              failed++;
            } else {
              processed++;
              processedIds.push(deposit.id);
            }
          } else {
            console.log(`Deposit ${deposit.id} is only ${Math.round(ageMinutes)}m old, will retry later`);
            failed++;
          }
        }
      } catch (e) {
        failed++;
        console.error(`Error processing deposit ${deposit.id}:`, e);
      }
    }

    console.log(`Retrying complete: ${processed} succeeded, ${failed} failed`);
    return {
      success: true,
      processed,
      failed,
      depositIds: processedIds
    };
  } catch (error) {
    console.error("Exception in retryPendingDeposits:", error);
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : "Unknown error processing pending deposits",
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const url = new URL(req.url);
    let options: DepositRetryOptions = {};
    
    // Handle GET or POST
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        options = body;
      } catch (error) {
        console.log("No valid JSON body, using defaults");
      }
    } else if (req.method === 'GET') {
      // Parse URL parameters
      const params = url.searchParams;
      const maxAttempts = params.get('maxAttempts');
      const maxAgeMins = params.get('maxAgeMins');
      const limitPerRun = params.get('limitPerRun');
      
      if (maxAttempts) options.maxAttempts = parseInt(maxAttempts);
      if (maxAgeMins) options.maxAgeMins = parseInt(maxAgeMins);
      if (limitPerRun) options.limitPerRun = parseInt(limitPerRun);
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await retryPendingDeposits(options);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error in retry-pending-deposits:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
