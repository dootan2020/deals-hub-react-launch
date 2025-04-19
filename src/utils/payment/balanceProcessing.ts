
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensure deposit is processed and user balance is updated
 */
export const processDepositBalance = async (
  depositId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('id, user_id, net_amount, status, transaction_id')
      .eq('id', depositId)
      .single();
      
    if (error) {
      console.error("Error fetching deposit:", error);
      return { success: false, error: error.message };
    }
    
    if (!deposit) {
      return { success: false, error: "Deposit not found" };
    }
    
    if (deposit.transaction_id && deposit.status !== 'completed') {
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId);
        
      if (updateError) {
        console.error("Error updating deposit status:", updateError);
        return { success: false, error: updateError.message };
      }
    }
    
    if (deposit.status === 'completed' || deposit.transaction_id) {
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
      
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception in processDepositBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing deposit balance" 
    };
  }
};

/**
 * Find and process all pending deposits with transaction IDs
 */
export const processAllPendingDeposits = async (): Promise<{ count: number, success: boolean, error?: string }> => {
  try {
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('id')
      .not('transaction_id', 'is', null)
      .eq('status', 'pending');
      
    if (error) {
      console.error("Error finding pending deposits:", error);
      return { count: 0, success: false, error: error.message };
    }
    
    if (!deposits || deposits.length === 0) {
      return { count: 0, success: true };
    }
    
    let processedCount = 0;
    for (const deposit of deposits) {
      const { success } = await processDepositBalance(deposit.id);
      if (success) processedCount++;
    }
    
    return { count: processedCount, success: true };
  } catch (error) {
    console.error("Exception in processAllPendingDeposits:", error);
    return { 
      count: 0, 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing pending deposits" 
    };
  }
};
