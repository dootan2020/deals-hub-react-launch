
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
  customId?: string,
  status: 'completed' | 'pending' | 'failed' | 'refunded' = 'completed'
): Promise<{success: boolean, message: string}> {
  try {
    console.log(`Processing deposit with transaction ID: ${transactionId}, custom ID: ${customId}, status: ${status}`);
    
    // Find the deposit record by transaction_id
    let { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, net_amount, status')
      .eq('transaction_id', transactionId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching deposit by transaction_id:", fetchError);
      return { success: false, message: `Database error: ${fetchError.message}` };
    }
    
    if (!deposit) {
      console.log("Deposit record not found by transaction_id, trying to find by custom_id");
      
      // Try to find by custom_id if passed
      if (customId) {
        const { data: depositByCustomId, error: customIdError } = await supabase
          .from('deposits')
          .select('id, user_id, amount, net_amount, status')
          .eq('id', customId)
          .maybeSingle();
        
        if (customIdError) {
          console.error("Error fetching deposit by custom_id:", customIdError);
          return { success: false, message: `Database error: ${customIdError.message}` };
        }
        
        if (!depositByCustomId) {
          console.error("Deposit record not found by custom_id either:", customId);
          return { success: false, message: `No deposit record found with custom_id: ${customId}` };
        }
        
        // Use the deposit found by custom_id
        deposit = depositByCustomId;
      } else {
        console.error("No custom_id available to find deposit");
        return { success: false, message: "Transaction ID not found and no custom ID provided" };
      }
    }
    
    if (!deposit) {
      console.error("No deposit record found for transaction:", transactionId);
      return { success: false, message: `No deposit record found for transaction: ${transactionId}` };
    }
    
    // Check if the deposit is already in the requested status
    if (deposit.status === status) {
      console.log(`Deposit already in ${status} status:`, transactionId);
      return { success: true, message: `Deposit already in ${status} status` };
    }
    
    // Update the deposit status and transaction_id if not already set
    const updateData: Record<string, any> = { 
      status,
      payer_email: payerEmail,
      payer_id: payerId
    };
    
    // Set the transaction_id if it's not already set
    if (!deposit.transaction_id) {
      updateData.transaction_id = transactionId;
    }
    
    console.log(`Updating deposit ${deposit.id} with data:`, updateData);
    
    const { error: updateError } = await supabase
      .from('deposits')
      .update(updateData)
      .eq('id', deposit.id);
    
    if (updateError) {
      console.error("Error updating deposit:", updateError);
      return { success: false, message: `Failed to update deposit: ${updateError.message}` };
    }
    
    // Only update the user balance when transaction is completed
    if (status === 'completed') {
      console.log(`Updating user balance for user ${deposit.user_id} with amount ${deposit.net_amount}`);
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
    
    console.log(`Successfully processed ${status} payment ${transactionId} for user ${deposit.user_id}`);
    return { success: true, message: `Payment ${status} processed successfully` };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in processDeposit:", error);
    return { success: false, message: `Exception processing deposit: ${errorMsg}` };
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
    let payload;
    try {
      payload = await req.json() as WebhookPayload;
      console.log("Received PayPal webhook:", JSON.stringify(payload));
    } catch (error) {
      console.error("Error parsing webhook payload:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload', details: error instanceof Error ? error.message : "Unknown error" }),
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

    const refundEvents = [
      'PAYMENT.CAPTURE.REFUNDED',
      'PAYMENT.SALE.REFUNDED'
    ];

    const transactionId = payload.resource.id;
    const payerEmail = payload.resource.payer?.email_address;
    const payerId = payload.resource.payer?.payer_id;
    
    // Try to get the custom_id which we set to the deposit id
    const customId = payload.resource.purchase_units?.[0]?.custom_id;

    // Process different event types
    let result: {success: boolean, message: string};
    
    if (successEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'completed');
    } else if (pendingEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'pending');
    } else if (failedEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'failed');
    } else if (refundEvents.includes(payload.event_type)) {
      result = await processDeposit(transactionId, payerEmail, payerId, customId, 'refunded');
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
        JSON.stringify({ error: result.message, event_type: payload.event_type }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
