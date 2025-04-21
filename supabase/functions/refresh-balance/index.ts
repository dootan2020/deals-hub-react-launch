
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Validate the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const userId = user.id;
    console.log(`Refreshing balance for user: ${userId}`);
    
    // Process any pending deposits that might not have been processed
    try {
      const { data: deposits } = await supabase
        .from('deposits')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (deposits && deposits.length > 0) {
        console.log(`Processing ${deposits.length} recent deposits for user ${userId}`);
        
        for (const deposit of deposits) {
          await processDeposit(supabase, deposit.id);
        }
      }
    } catch (error) {
      console.error("Error processing recent deposits:", error);
      // Continue with balance refresh even if this fails
    }
    
    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch user profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Reconcile balance with transactions if needed
    const { data: transactionSum, error: transactionError } = await supabase.rpc(
      'calculate_user_balance',
      { user_id_param: userId }
    );
    
    let reconciledBalance = profile.balance;
    let balanceUpdated = false;
    
    if (!transactionError && transactionSum !== null && transactionSum !== profile.balance) {
      console.log(`Balance discrepancy detected: DB=${profile.balance}, Calculated=${transactionSum}`);
      
      // Update the balance to match transaction history
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: transactionSum })
        .eq('id', userId);
      
      if (!updateError) {
        reconciledBalance = transactionSum;
        balanceUpdated = true;
        console.log(`Balance reconciled to ${transactionSum}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: reconciledBalance,
        reconciled: balanceUpdated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-balance function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function processDeposit(supabase: any, depositId: string): Promise<void> {
  try {
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('id, user_id, net_amount, status, transaction_id')
      .eq('id', depositId)
      .single();
      
    if (error || !deposit) {
      console.error("Error fetching deposit:", error);
      return;
    }
    
    if (deposit.status === 'completed' && deposit.transaction_id) {
      console.log(`Ensuring balance is updated for completed deposit ${depositId}`);
      
      await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: deposit.user_id,
          amount_param: deposit.net_amount
        }
      );
    }
  } catch (error) {
    console.error("Error processing deposit:", error);
  }
}
