
import { supabase } from '@/integrations/supabase/client';

/**
 * Process deposit and update user balance
 */
export async function processDepositBalance(depositId: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Get deposit details
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();
      
    if (depositError || !deposit) {
      console.error("Error fetching deposit:", depositError);
      return { success: false, error: "Could not find deposit" };
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
      console.error("Error updating balance:", balanceError);
      return { success: false, error: "Failed to update user balance" };
    }
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: deposit.user_id,
        amount: deposit.amount,
        type: 'deposit',
        status: 'completed',
        payment_method: deposit.payment_method,
        transaction_id: deposit.transaction_id
      });
    
    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return { success: false, error: "Failed to record transaction" };
    }
    
    console.log("Successfully processed deposit and updated balance");
    return { success: true };
    
  } catch (error) {
    console.error("Exception in processDepositBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing deposit balance" 
    };
  }
}
