
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
    
    // Start a transaction
    const { data: balanceResult, error: balanceError } = await supabase.rpc('update_user_balance', {
      user_id_param: userId,
      amount_param: amount
    });
    
    if (balanceError) {
      console.error("Error updating user balance:", balanceError);
      return { success: false, error: balanceError.message };
    }
    
    // If result is false, it means no row was found/updated
    if (balanceResult === false) {
      return { success: false, error: "User profile not found" };
    }
    
    // Record the transaction
    const { error: transactionError } = await supabase.from('transactions').insert({
      user_id: userId,
      amount: amount,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      status: 'completed',
      description: description,
      reference_id: referenceId
    });
    
    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Don't fail the operation if transaction recording fails
    }
    
    // Fetch the new balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      console.warn("Couldn't fetch updated balance:", profileError);
      return { success: true };
    }
    
    return { success: true, newBalance: profile.balance };
  } catch (error) {
    console.error("Exception in updateUserBalance:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error updating user balance" 
    };
  }
};
