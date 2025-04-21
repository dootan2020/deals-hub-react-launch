
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

    // Calculate the correct balance from transaction history
    // This is now handled by a database function to prevent excessive recursion
    const { data, error } = await supabase.rpc(
      'calculate_user_balance_from_transactions',
      { user_id_param: userId }
    );

    if (error) throw error;

    const calculatedBalance = data;
    const difference = calculatedBalance - currentBalance;

    // If there's a difference, update the balance
    if (Math.abs(difference) > 0.01) {
      // Instead of directly setting the balance, calculate the adjustment needed
      const updated = await updateUserBalance(userId, difference);
      if (!updated) {
        return {
          success: false,
          message: 'Failed to reconcile balance',
          oldBalance: currentBalance,
          newBalance: calculatedBalance,
          difference
        };
      }

      return {
        success: true,
        message: 'Balance reconciled successfully',
        oldBalance: currentBalance,
        newBalance: calculatedBalance,
        difference
      };
    }

    return {
      success: true,
      message: 'Balance is already correct',
      oldBalance: currentBalance,
      newBalance: calculatedBalance,
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
