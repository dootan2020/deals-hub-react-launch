
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Updates user balance and returns success status
 * @param userId User ID to update balance for
 * @param amount Amount to add (positive) or subtract (negative)
 * @returns Boolean indicating success
 */
export async function updateUserBalance(userId: string, amount: number): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Use the update_user_balance RPC function to safely update balance
    const { data, error } = await supabase.rpc(
      'update_user_balance',
      {
        user_id_param: userId,
        amount_param: amount
      }
    );

    if (error) throw error;

    return !!data;
  } catch (error) {
    console.error('Error updating user balance:', error);
    return false;
  }
}

/**
 * Fetches the current user balance
 * @param userId User ID to fetch balance for
 * @returns Current balance or null if error
 */
export async function getUserBalance(userId: string): Promise<number | null> {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.balance ?? null;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return null;
  }
}

/**
 * Handles a purchase transaction, checking balance and deducting if sufficient
 * @param userId User ID
 * @param amount Purchase amount (positive number)
 * @returns Transaction result
 */
export async function processPurchase(userId: string, amount: number): Promise<{
  success: boolean;
  message: string;
  remainingBalance?: number;
}> {
  if (!userId) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      message: 'Amount must be greater than zero'
    };
  }
  
  try {
    // First get current balance
    const balance = await getUserBalance(userId);
    
    if (balance === null) {
      return {
        success: false,
        message: 'Could not retrieve user balance'
      };
    }
    
    // Check if user has enough balance
    if (balance < amount) {
      return {
        success: false,
        message: `Insufficient balance: ${balance} < ${amount}`
      };
    }
    
    // Deduct the amount (negative amount)
    const updated = await updateUserBalance(userId, -amount);
    
    if (!updated) {
      return {
        success: false,
        message: 'Failed to update balance'
      };
    }
    
    const newBalance = await getUserBalance(userId);
    
    return {
      success: true,
      message: 'Purchase processed successfully',
      remainingBalance: newBalance ?? undefined
    };
  } catch (error: any) {
    console.error('Error processing purchase:', error);
    return {
      success: false,
      message: error.message || 'An error occurred processing the purchase'
    };
  }
}

// Process a deposit by ID, changing its status to completed if verified
export async function processDepositBalance(depositId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    console.log(`Processing deposit: ${depositId}`);
    
    // First, verify the deposit exists and get its details
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', depositId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching deposit:", fetchError);
      return { 
        success: false, 
        error: fetchError.message 
      };
    }
    
    if (!deposit) {
      return {
        success: false,
        error: `Deposit ${depositId} not found`
      };
    }
    
    // If already completed, return success
    if (deposit.status === 'completed') {
      return {
        success: true,
        message: 'Deposit already processed'
      };
    }
    
    // Update the deposit status
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ status: 'completed' })
      .eq('id', depositId);
      
    if (updateError) {
      console.error("Error updating deposit status:", updateError);
      return {
        success: false,
        error: updateError.message
      };
    }
    
    // Add the balance to the user's account
    const updated = await updateUserBalance(deposit.user_id, deposit.net_amount);
    
    if (!updated) {
      console.error("Failed to update user balance");
      return {
        success: false,
        error: "Failed to update balance"
      };
    }
    
    console.log(`Deposit ${depositId} processed successfully`);
    return {
      success: true,
      message: `Deposit processed successfully`
    };
  } catch (error: any) {
    console.error("Error in processDepositBalance:", error);
    return {
      success: false,
      error: error.message || "Unknown error processing deposit"
    };
  }
}

// Function to reconcile user balance with transaction history
export async function reconcileUserBalance(userId: string): Promise<{
  success: boolean;
  message: string;
  oldBalance?: number;
  newBalance?: number;
  difference?: number;
}> {
  if (!userId) {
    return {
      success: false,
      message: 'User ID is required'
    };
  }

  try {
    // Get the current balance first to compare later
    const currentBalance = await getUserBalance(userId);
    if (currentBalance === null) {
      return {
        success: false,
        message: 'Could not retrieve current balance'
      };
    }

    // Get the calculated balance from transaction history by using a database function
    const { data: calculatedBalance, error } = await supabase.functions.invoke(
      'refresh-balance',
      { 
        body: { 
          user_id: userId,
          action: 'calculate'
        } 
      }
    );

    if (error) {
      console.error("Error calculating balance from transactions:", error);
      return {
        success: false,
        message: error.message || 'Failed to calculate balance from transactions'
      };
    }

    // Check if we got a valid number back
    if (calculatedBalance === null || calculatedBalance === undefined || 
        typeof calculatedBalance.balance !== 'number') {
      return {
        success: false,
        message: 'Invalid balance calculation result'
      };
    }

    const finalCalculatedBalance = calculatedBalance.balance;
    const difference = Number(finalCalculatedBalance) - Number(currentBalance);

    // If there's a difference, update the balance
    if (Math.abs(difference) > 0.01) {
      // Instead of directly setting the balance, calculate the adjustment needed
      const updated = await updateUserBalance(userId, difference);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to reconcile balance',
          oldBalance: currentBalance,
          newBalance: finalCalculatedBalance,
          difference
        };
      }

      return {
        success: true,
        message: 'Balance reconciled successfully',
        oldBalance: currentBalance,
        newBalance: finalCalculatedBalance,
        difference
      };
    }

    return {
      success: true,
      message: 'Balance is already correct',
      oldBalance: currentBalance,
      newBalance: finalCalculatedBalance,
      difference
    };
  } catch (error: any) {
    console.error('Error reconciling balance:', error);
    return {
      success: false,
      message: error.message || 'An error occurred reconciling the balance'
    };
  }
}
