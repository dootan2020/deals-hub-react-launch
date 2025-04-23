
import { supabase } from "@/integrations/supabase/client";

export const processDepositBalance = async (depositId: string): Promise<{ success: boolean; updated?: boolean; error?: string }> => {
  try {
    console.log(`Processing deposit balance for ID: ${depositId}`);
    
    // Check if the deposit exists and get its details
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching deposit:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // If deposit doesn't exist or is already completed, no need to proceed
    if (!deposit) {
      return { success: false, error: "Deposit not found" };
    }
    
    if (deposit.status === 'completed') {
      console.log(`Deposit ${depositId} already completed, no action needed`);
      return { success: true, updated: false };
    }
    
    // Update deposit status to completed
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ status: 'completed' })
      .eq('id', depositId);
    
    if (updateError) {
      console.error("Error updating deposit status:", updateError);
      return { success: false, error: updateError.message };
    }
    
    // Update user balance
    const { error: balanceError } = await supabase.rpc(
      'update_user_balance',
      {
        user_id_param: deposit.user_id,
        amount_param: deposit.net_amount
      }
    );
    
    if (balanceError) {
      console.error("Error updating user balance:", balanceError);
      return { success: false, error: balanceError.message };
    }
    
    console.log(`Successfully processed deposit ${depositId} and updated user balance`);
    return { success: true, updated: true };
  } catch (error) {
    console.error("Exception in processDepositBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing deposit" 
    };
  }
};

export const createTransactionRecord = async (userId: string, amount: number, type = 'deposit') => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        amount,
        type,
        status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      error: 'Failed to create transaction record'
    };
  }
};
