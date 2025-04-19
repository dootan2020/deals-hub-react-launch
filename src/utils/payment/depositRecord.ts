
import { supabase } from '@/integrations/supabase/client';

/**
 * Create a deposit record in the database
 */
export const createDepositRecord = async (
  userId: string, 
  grossAmount: number
): Promise<{ id: string | null, success: boolean, error?: string }> => {
  try {
    console.log(`Creating deposit record for user: ${userId}, amount: $${grossAmount}`);
    
    if (isNaN(grossAmount) || grossAmount < 1) {
      console.error("Invalid deposit amount", grossAmount);
      return { id: null, success: false, error: "Invalid deposit amount" };
    }
    
    if (!userId) {
      console.error("Missing user ID for deposit");
      return { id: null, success: false, error: "Missing user ID" };
    }
    
    const netAmount = calculateNetAmount(grossAmount);
    console.log(`Calculated net amount: $${netAmount} (after fee)`);
    
    const { data, error: insertError } = await supabase
      .from('deposits')
      .insert({
        user_id: userId,
        amount: grossAmount,
        net_amount: netAmount,
        payment_method: 'paypal',
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertError) {
      console.error("Error creating deposit record:", insertError);
      
      if (insertError.message?.includes('row-level security')) {
        return { 
          id: null, 
          success: false, 
          error: "Authorization error: Please ensure you're logged in" 
        };
      }
      
      return { id: null, success: false, error: insertError.message };
    }
    
    console.log("Deposit record created successfully with ID:", data.id);
    return { id: data.id, success: true };
    
  } catch (error) {
    console.error("Exception in createDepositRecord:", error);
    return { 
      id: null, 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error creating deposit" 
    };
  }
};

import { calculateNetAmount } from './calculateFees';

/**
 * Update a deposit record with a transaction ID
 */
export const updateDepositWithTransaction = async (
  depositId: string, 
  transactionId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log(`Updating deposit ${depositId} with transaction ID: ${transactionId}`);
    
    if (!depositId || !transactionId) {
      console.error("Missing required parameters", { depositId, transactionId });
      return { success: false, error: "Missing deposit ID or transaction ID" };
    }
    
    const { error } = await supabase
      .from('deposits')
      .update({
        transaction_id: transactionId,
        status: 'completed'
      })
      .eq('id', depositId);

    if (error) {
      console.error("Error updating deposit record:", error);
      return { success: false, error: error.message };
    }
    
    await processDepositBalance(depositId);
    
    console.log("Deposit record updated and balance updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Exception in updateDepositWithTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error updating deposit" 
    };
  }
};
