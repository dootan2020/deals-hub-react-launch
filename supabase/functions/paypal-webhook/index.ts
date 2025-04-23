
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
      reference_id?: string;
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

async function processDeposit(
  transactionId: string, 
  payerEmail?: string, 
  payerId?: string,
  customId?: string,
  status: 'completed' | 'pending' | 'failed' = 'completed'
): Promise<{success: boolean, message: string}> {
  try {
    // Find the deposit record
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, net_amount, status')
      .eq('transaction_id', transactionId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching deposit:", fetchError);
      return { success: false, message: `Database error: ${fetchError.message}` };
    }
    
    // If deposit already completed, return success
    if (deposit.status === 'completed') {
      return { success: true, message: `Deposit already completed` };
    }
    
    // Update the deposit
    const { error: updateError } = await supabase
      .from('deposits')
      .update({
        status,
        payer_email: payerEmail,
        payer_id: payerId
      })
      .eq('id', deposit.id);
    
    if (updateError) {
      console.error("Error updating deposit:", updateError);
      return { success: false, message: `Failed to update deposit: ${updateError.message}` };
    }
    
    // Only update balance for completed transactions
    if (status === 'completed') {
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: deposit.user_id,
          amount_param: deposit.net_amount
        }
      );
      
      if (balanceError) {
        console.error("Error updating user balance:", balanceError);
        return { success: false, message: `Failed to update user balance: ${balanceError.message}` };
      }
    }
    
    return { success: true, message: `Payment ${status} processed successfully` };
  } catch (error) {
    console.error("Error in processDeposit:", error);
    return { success: false, message: `Exception processing deposit: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse webhook payload
    let payload;
    try {
      payload = await req.json() as WebhookPayload;
      console.log("Received PayPal webhook:", JSON.stringify(payload));
    } catch (error) {
      console.error("Error parsing webhook payload:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const successEvents = [
      'PAYMENT.CAPTURE.COMPLETED', 
      'PAYMENT.SALE.COMPLETED',
      'CHECKOUT.ORDER.COMPLETED'
    ];

    const pendingEvents = [
      'PAYMENT.CAPTURE.PENDING',
      'PAYMENT.SALE.PENDING'
    ];

    const failedEvents = [
      'PAYMENT.CAPTURE.DENIED',
      'PAYMENT.SALE.DENIED',
      'PAYMENT.CAPTURE.DECLINED',
      'PAYMENT.SALE.DECLINED'
    ];

    const transactionId = payload.resource.id;
    const payerEmail = payload.resource.payer?.email_address;
    const payerId = payload.resource.payer?.payer_id;
    const customId = payload.resource.purchase_units?.[0]?.custom_id;

    // Process different event types
    let result;
    
    if (successEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'completed');
    } else if (pendingEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'pending');
    } else if (failedEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'failed');
    } else {
      console.log(`Unhandled event type: ${payload.event_type}`);
      return new Response(
        JSON.stringify({ warning: 'Unhandled event type', event: payload.event_type }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return result
    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: result.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
