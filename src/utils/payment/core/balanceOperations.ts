
import { supabase } from '@/integrations/supabase/client';

/**
 * Safely update user balance by a given amount
 */
export const updateUserBalance = async (
  userId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<{ success: boolean, error?: string, newBalance?: number }> => {
  if (!userId || isNaN(amount)) {
    return { success: false, error: "Invalid user ID or amount" };
  }
  
  try {
    console.log(`Updating balance for user ${userId}: ${amount > 0 ? '+' : ''}${amount}`);
    
    // Direct RPC call without complex generic types
    const balanceResponse = await supabase.rpc('update_user_balance', {
      user_id_param: userId,
      amount_param: amount
    });
    
    if (balanceResponse.error) {
      console.error("Error updating user balance:", balanceResponse.error);
      return { success: false, error: balanceResponse.error.message };
    }
    
    // If result is false, it means no row was found/updated
    if (balanceResponse.data === false) {
      return { success: false, error: "User profile not found" };
    }
    
    // Record the transaction - direct approach
    const transactionResponse = await supabase.from('transactions').insert({
      user_id: userId,
      amount: amount,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: description,
      reference_id: referenceId
    });
    
    if (transactionResponse.error) {
      console.error("Error recording transaction:", transactionResponse.error);
      // Don't fail the operation if transaction recording fails
    }
    
    // Fetch the new balance - direct approach
    const profileResponse = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
      
    if (profileResponse.error || !profileResponse.data) {
      console.warn("Couldn't fetch updated balance:", profileResponse.error);
      return { success: true };
    }
    
    return { success: true, newBalance: profileResponse.data.balance };
  } catch (error) {
    console.error("Exception in updateUserBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error updating user balance" 
    };
  }
};
