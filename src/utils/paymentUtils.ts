
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
 * @returns The ID of the created deposit record
 */
export const createDepositRecord = async (userId: string, grossAmount: number): Promise<string | null> => {
  try {
    if (isNaN(grossAmount) || grossAmount < 1) {
      console.error("Invalid deposit amount", grossAmount);
      return null;
    }
    
    const netAmount = calculateNetAmount(grossAmount);
    
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
      .single() as any;

    if (error) {
      console.error("Error creating deposit record:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createDepositRecord:", error);
    return null;
  }
};

/**
 * Update a deposit record with a transaction ID
 * @param depositId The deposit ID
 * @param transactionId The transaction ID
 * @returns Whether the update was successful
 */
export const updateDepositWithTransaction = async (
  depositId: string, 
  transactionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('deposits')
      .update({
        transaction_id: transactionId
      })
      .eq('id', depositId);

    if (error) {
      console.error("Error updating deposit record:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateDepositWithTransaction:", error);
    return false;
  }
};
