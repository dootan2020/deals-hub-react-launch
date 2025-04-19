
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
    refund?: {
      amount?: {
        value: string;
      };
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
  amount?: string,
  status: 'completed' | 'pending' | 'failed' | 'refunded' = 'completed'
): Promise<boolean> {
  try {
    console.log(`Processing deposit with transaction ID: ${transactionId}, status: ${status}`);
    
    // Find the deposit record
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, net_amount, status')
      .eq('transaction_id', transactionId)
      .single();
    
    if (fetchError) {
      console.error("Deposit record not found by transaction_id:", transactionId);
      
      // Try to find by custom_id if passed in purchase_units
      const { data: depositByCustomId, error: customIdError } = await supabase
        .from('deposits')
        .select('id, user_id, amount, net_amount, status')
        .eq('id', amount) // Using amount as custom_id if passed
        .single();
        
      if (customIdError || !depositByCustomId) {
        console.error("Deposit record not found by custom_id either:", amount);
        return false;
      }
      
      // Use the deposit found by custom_id
      deposit = depositByCustomId;
    }
    
    if (!deposit) {
      console.error("No deposit record found for transaction:", transactionId);
      return false;
    }
    
    // Check if the deposit is already in the requested status
    if (deposit.status === status) {
      console.log(`Deposit already in ${status} status:`, transactionId);
      return true;
    }
    
    // Update the deposit status
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ 
        status: status, 
        payer_email: payerEmail,
        payer_id: payerId
      })
      .eq('id', deposit.id);
    
    if (updateError) {
      console.error("Error updating deposit:", updateError);
      return false;
    }
    
    // Only update the user balance when transaction is completed
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
        return false;
      }
    }
    
    console.log(`Successfully processed ${status} payment ${transactionId} for user ${deposit.user_id}`);
    return true;
  } catch (error) {
    console.error("Error in processDeposit:", error);
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
      'PAYMENT.SALE.DENIED'
    ];

    const refundEvents = [
      'PAYMENT.CAPTURE.REFUNDED',
      'PAYMENT.SALE.REFUNDED'
    ];

    const transactionId = payload.resource.id;
    const payerEmail = payload.resource.payer?.email_address;
    const payerId = payload.resource.payer?.payer_id;
    
    // Try to get the custom_id which we set to the deposit id
    const customId = payload.resource.purchase_units?.[0]?.custom_id;
    const amount = payload.resource.purchase_units?.[0]?.amount?.value;

    // Process different event types
    let success = false;
    if (successEvents.includes(payload.event_type)) {
      success = await processDeposit(transactionId, payerEmail, payerId, customId, 'completed');
    } else if (pendingEvents.includes(payload.event_type)) {
      success = await processDeposit(transactionId, payerEmail, payerId, customId, 'pending');
    } else if (failedEvents.includes(payload.event_type)) {
      success = await processDeposit(transactionId, payerEmail, payerId, customId, 'failed');
    } else if (refundEvents.includes(payload.event_type)) {
      success = await processDeposit(transactionId, payerEmail, payerId, customId, 'refunded');
    }
    
    // Return result
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
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
