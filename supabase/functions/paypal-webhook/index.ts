
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
    purchase_units?: Array<{
      amount: {
        value: string;
        currency_code: string;
      };
      custom_id?: string;
      payee?: {
        email_address?: string;
      };
    }>;
    payer?: {
      email_address?: string;
      payer_id?: string;
    };
  };
  summary?: string;
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function processSuccessfulPayment(
  transactionId: string, 
  payerEmail?: string, 
  payerId?: string
): Promise<boolean> {
  try {
    // Find the deposit record
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, net_amount, status')
      .eq('transaction_id', transactionId)
      .single();
    
    if (fetchError || !deposit) {
      console.error("Deposit record not found:", transactionId);
      return false;
    }
    
    // Check if already processed
    if (deposit.status === 'completed') {
      console.log("Deposit already processed:", transactionId);
      return true;
    }
    
    // Update deposit record
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ 
        status: 'completed', 
        payer_email: payerEmail,
        payer_id: payerId
      })
      .eq('id', deposit.id);
    
    if (updateError) {
      console.error("Error updating deposit:", updateError);
      return false;
    }
    
    // Update user balance
    const { data: updateResult, error: balanceError } = await supabase.rpc(
      'update_user_balance',
      {
        user_id_param: deposit.user_id,
        amount_param: deposit.net_amount
      }
    );
    
    if (balanceError) {
      console.error("Error updating user balance:", balanceError);
      return false;
    }
    
    console.log(`Successfully processed payment ${transactionId} for user ${deposit.user_id}`);
    return true;
  } catch (error) {
    console.error("Error in processSuccessfulPayment:", error);
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
      const payerEmail = payload.resource.payer?.email_address;
      const payerId = payload.resource.payer?.payer_id;
      
      const success = await processSuccessfulPayment(
        transactionId,
        payerEmail,
        payerId
      );
      
      if (success) {
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to process payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
