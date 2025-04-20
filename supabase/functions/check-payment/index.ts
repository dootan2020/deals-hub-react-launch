
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function handles status checks for payments and attempts to update the user balance if needed
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { transaction_id: transactionId } = await req.json();
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Tìm deposit bằng transaction_id
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, net_amount, status, created_at')
      .eq('transaction_id', transactionId)
      .maybeSingle();
    
    if (depositError) {
      console.error('Error fetching deposit:', depositError);
      return new Response(
        JSON.stringify({ success: false, error: depositError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    if (!deposit) {
      return new Response(
        JSON.stringify({ success: false, error: 'No deposit found with this transaction ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Nếu trạng thái đã là completed, chỉ trả về thông tin
    if (deposit.status === 'completed') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: deposit.status,
          deposit: {
            id: deposit.id,
            user_id: deposit.user_id,
            amount: deposit.amount,
            net_amount: deposit.net_amount,
            created_at: deposit.created_at
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Nếu pending và có transaction_id, cập nhật thành completed
    if (deposit.status === 'pending' && transactionId) {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', deposit.id);
      
      if (updateError) {
        console.error('Error updating deposit status:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Cập nhật số dư người dùng
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: deposit.user_id,
          amount_param: deposit.net_amount
        }
      );
      
      if (balanceError) {
        console.error('Error updating user balance:', balanceError);
        return new Response(
          JSON.stringify({ success: false, error: balanceError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'completed',
          message: 'Deposit marked as completed and user balance updated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Trường hợp giao dịch có trạng thái khác
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: deposit.status,
        message: `Deposit is in ${deposit.status} status`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in check-payment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
