import { supabase } from '@/integrations/supabase/client';
import { BalanceUpdateResponse } from '@/types/rpc';

/**
 * Simple response type for transaction operations
 */
interface TransactionResponse {
  success: boolean;
  error?: string;
}

/**
 * Simple deposit data interface to replace complex supabase return types
 */
interface DepositData {
  id: string;
  user_id: string;
  net_amount: number;
  status: string;
  transaction_id: string | null;
}

/**
 * Create a transaction record for a deposit if one doesn't exist
 */
export const createTransactionRecord = async (
  userId: string, 
  amount: number, 
  depositId: string,
  transactionId?: string | null
): Promise<boolean> => {
  try {
    // Check if a transaction with the given reference_id already exists
    // Using a direct fetch approach without complex types
    const response = await supabase.from('transactions').select('id').eq('reference_id', depositId).maybeSingle();
    
    if (response.error) {
      console.error("Error checking for existing transaction:", response.error);
      return false;
    }
      
    if (!response.data) {
      const insertResponse = await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        type: 'deposit',
        status: 'completed',
        description: `Deposit processed via ${transactionId ? 'PayPal' : 'manual'} payment`,
        reference_id: depositId
      });
      
      if (insertResponse.error) {
        console.error("Error creating transaction record:", insertResponse.error);
        return false;
      }
      
      console.log(`Created transaction record for deposit ${depositId}`);
      return true;
    }
    
    return false; // Transaction already exists
  } catch (error) {
    console.error("Error in createTransactionRecord:", error);
    return false;
  }
};

/**
 * Ensure deposit is processed and user balance is updated
 */
export const processDepositBalance = async (
  depositId: string
): Promise<{ success: boolean, error?: string, updated: boolean }> => {
  try {
    console.log(`Processing deposit balance for deposit ID: ${depositId}`);
    
    // Get deposit details with explicit typing
    const depositResponse = await supabase
      .from('deposits')
      .select('id, user_id, net_amount, status, transaction_id')
      .eq('id', depositId)
      .maybeSingle();
      
    if (depositResponse.error) {
      console.error("Error fetching deposit:", depositResponse.error);
      return { success: false, error: depositResponse.error.message, updated: false };
    }
    
    const deposit = depositResponse.data as DepositData | null;
    
    if (!deposit) {
      return { success: false, error: "Deposit not found", updated: false };
    }
    
    console.log(`Deposit found:`, deposit);
    
    let statusUpdated = false;
    if (deposit.transaction_id && deposit.status !== 'completed') {
      // Update deposit status with explicit typing
      const updateResponse = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId);
        
      if (updateResponse.error) {
        console.error("Error updating deposit status:", updateResponse.error);
        return { success: false, error: updateResponse.error.message, updated: false };
      }
      
      statusUpdated = true;
      console.log(`Deposit ${depositId} status updated to completed`);
    }
    
    if (deposit.status === 'completed' || deposit.transaction_id) {
      console.log(`Calling update_user_balance for user ${deposit.user_id} with amount ${deposit.net_amount}`);
      
      // RPC call with explicit typing using "as"
      const balanceResponse = await supabase.rpc('update_user_balance', {
        user_id_param: deposit.user_id,
        amount_param: deposit.net_amount
      }) as BalanceUpdateResponse;
      
      if (balanceResponse.error) {
        console.error("Error updating user balance:", balanceResponse.error);
        return { success: false, error: balanceResponse.error.message, updated: false };
      }
      
      if (balanceResponse.data === false) {
        console.warn("Balance update did not affect any rows");
        return { success: false, error: "User profile not found", updated: false };
      }
      
      console.log(`Successfully updated balance for user ${deposit.user_id}`);
      
      await createTransactionRecord(
        deposit.user_id,
        deposit.net_amount,
        deposit.id,
        deposit.transaction_id
      );
      
      return { success: true, updated: true };
    }
    
    return { success: true, updated: statusUpdated };
  } catch (error) {
    console.error("Exception in processDepositBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing deposit balance", 
      updated: false 
    };
  }
};
