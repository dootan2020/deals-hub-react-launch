
import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate the PayPal fee for a given amount
 * @param amount The amount to calculate the fee for
 * @returns The PayPal fee
 */
export const calculateFee = (amount: number): number => {
  if (isNaN(amount) || amount <= 0) return 0;
  
  const feePercentage = 0.039;
  const fixedFee = 0.30;
  return Number((amount * feePercentage + fixedFee).toFixed(2));
};

/**
 * Calculate the net amount after PayPal fee
 * @param amount The gross amount
 * @returns The net amount after PayPal fee
 */
export const calculateNetAmount = (amount: number): number => {
  if (isNaN(amount) || amount <= 0) return 0;
  
  return Number((amount - calculateFee(amount)).toFixed(2));
};

/**
 * Create a deposit record in the database
 * @param userId The user ID
 * @param grossAmount The gross amount
 * @returns The ID of the created deposit record and success status
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
    
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error creating deposit record:", error);
      return { id: null, success: false, error: error.message };
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

/**
 * Update a deposit record with a transaction ID
 * @param depositId The deposit ID
 * @param transactionId The transaction ID
 * @returns Whether the update was successful and any error message
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
        transaction_id: transactionId
      })
      .eq('id', depositId);

    if (error) {
      console.error("Error updating deposit record:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Deposit record updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Exception in updateDepositWithTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error updating deposit" 
    };
  }
};
