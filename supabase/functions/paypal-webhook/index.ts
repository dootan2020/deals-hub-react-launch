
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event_type: string;
  resource: {
    id: string;
    status: string;
    amount: {
      value: string;
    };
    custom_id?: string;
  };
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserBalance(userId: string, amount: number): Promise<boolean> {
  try {
    // Start a transaction to update the user's balance
    const { data, error } = await supabase.rpc('update_user_balance', {
      user_id_param: userId,
      amount_param: amount
    });
    
    if (error) {
      console.error("Error updating user balance:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateUserBalance:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    
    console.log("Received PayPal webhook:", JSON.stringify(payload));

    // Process payment completion events
    if (
      payload.event_type === 'PAYMENT.CAPTURE.COMPLETED' || 
      payload.event_type === 'CHECKOUT.ORDER.APPROVED'
    ) {
      const transactionId = payload.resource.id;
      
      // Find the transaction in our database
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('user_id, amount, status')
        .eq('transaction_id', transactionId)
        .single();
      
      if (transactionError || !transaction) {
        console.error("Transaction not found:", transactionId);
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verify the transaction hasn't been processed already
      if (transaction.status === 'completed') {
        console.log("Transaction already processed:", transactionId);
        return new Response(
          JSON.stringify({ message: 'Transaction already processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('transaction_id', transactionId);
      
      if (updateError) {
        console.error("Error updating transaction status:", updateError);
        return new Response(
          JSON.stringify({ error: 'Error updating transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update user balance
      const success = await updateUserBalance(transaction.user_id, transaction.amount);
      
      if (!success) {
        console.error("Failed to update user balance for transaction:", transactionId);
        return new Response(
          JSON.stringify({ error: 'Failed to update user balance' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Successfully processed payment: ${transactionId} for user: ${transaction.user_id}`);
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For other event types, just acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
