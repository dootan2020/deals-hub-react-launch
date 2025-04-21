
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensure deposit is processed and user balance is updated
 */
export const processDepositBalance = async (
  depositId: string
): Promise<{ success: boolean, error?: string, updated: boolean }> => {
  try {
    console.log(`Processing deposit balance for deposit ID: ${depositId}`);
    
    // Get deposit details
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('id, user_id, net_amount, status, transaction_id')
      .eq('id', depositId)
      .single();
      
    if (error) {
      console.error("Error fetching deposit:", error);
      return { success: false, error: error.message, updated: false };
    }
    
    if (!deposit) {
      return { success: false, error: "Deposit not found", updated: false };
    }
    
    console.log(`Deposit found:`, deposit);
    
    // If deposit has transaction ID but is not completed, mark it as completed
    let statusUpdated = false;
    if (deposit.transaction_id && deposit.status !== 'completed') {
      console.log(`Updating deposit ${depositId} status to completed`);
      
      const { error: updateError } = await supabase
        .from('deposits')
        .update({ status: 'completed' })
        .eq('id', depositId);
        
      if (updateError) {
        console.error("Error updating deposit status:", updateError);
        return { success: false, error: updateError.message, updated: false };
      }
      
      statusUpdated = true;
      console.log(`Deposit ${depositId} status updated to completed`);
    }
    
    // Always update the balance if status is completed or has transaction_id,
    // regardless of whether we just updated the status
    if (deposit.status === 'completed' || deposit.transaction_id) {
      console.log(`Calling update_user_balance for user ${deposit.user_id} with amount ${deposit.net_amount}`);
      
      const { data: updateResult, error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: deposit.user_id,
          amount_param: deposit.net_amount
        }
      );
      
      if (balanceError) {
        console.error("Error updating user balance:", balanceError);
        return { success: false, error: balanceError.message, updated: false };
      }
      
      // If result is false, it means no row was found/updated
      if (updateResult === false) {
        console.warn("Balance update did not affect any rows");
        return { success: false, error: "User profile not found", updated: false };
      }
      
      console.log(`Successfully updated balance for user ${deposit.user_id}`);
      
      // Record a transaction entry if one doesn't exist for this deposit
      try {
        const { data: existingTransaction } = await supabase
          .from('transactions')
          .select('id')
          .eq('reference_id', deposit.id)
          .maybeSingle();
          
        if (!existingTransaction) {
          await supabase.from('transactions').insert({
            user_id: deposit.user_id,
            amount: deposit.net_amount,
            type: 'deposit',
            status: 'completed',
            description: `Deposit processed via ${deposit.transaction_id ? 'PayPal' : 'manual'} payment`,
            reference_id: deposit.id
          });
          console.log(`Created transaction record for deposit ${deposit.id}`);
        }
      } catch (txnError) {
        console.error("Error checking/creating transaction record:", txnError);
        // Don't fail the overall operation if this fails
      }
      
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

/**
 * Find and process all pending deposits with transaction IDs
 */
export const processAllPendingDeposits = async (): Promise<{ count: number, success: boolean, error?: string }> => {
  try {
    console.log("Looking for pending deposits with transaction IDs");
    
    // First query: find deposits with transaction IDs that are still pending
    const { data: deposits, error } = await supabase
      .from('deposits')
      .select('id')
      .not('transaction_id', 'is', null)
      .eq('status', 'pending');
      
    if (error) {
      console.error("Error finding pending deposits:", error);
      return { count: 0, success: false, error: error.message };
    }
    
    let pendingDeposits = deposits || [];
    
    // Second query: find completed deposits that may not have had their balance updated
    // Check last 24 hours to avoid processing very old deposits
    const { data: completedDeposits, error: error2 } = await supabase
      .from('deposits')
      .select('id, user_id')
      .eq('status', 'completed')
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error2 && completedDeposits) {
      // Add completed deposits to our list
      pendingDeposits = [...pendingDeposits, ...completedDeposits];
    }
    
    if (pendingDeposits.length === 0) {
      console.log("No pending or recent deposits found to process");
      return { count: 0, success: true };
    }
    
    console.log(`Found ${pendingDeposits.length} deposits to process`);
    
    let processedCount = 0;
    for (const deposit of pendingDeposits) {
      const { success, updated } = await processDepositBalance(deposit.id);
      if (success && updated) processedCount++;
    }
    
    console.log(`Successfully processed ${processedCount} deposits`);
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
    const { data: balanceResult, error: balanceError } = await supabase.rpc(
      'update_user_balance',
      {
        user_id_param: userId,
        amount_param: amount
      }
    );
    
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
