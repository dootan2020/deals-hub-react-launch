
import { supabase } from '@/integrations/supabase/client';
import { processDepositBalance } from './depositProcessor';
import { processSpecificTransaction } from './transactionVerifier';

/**
 * Check deposit status by transaction ID or order ID
 */
export const checkDepositStatus = async (
  id: string
): Promise<{ success: boolean, status?: string, deposit?: any, error?: string, message?: string }> => {
  try {
    console.log(`Checking deposit status for ID: ${id}`);
    
    if (!id) {
      return { success: false, error: "ID is required" };
    }
    
    // First, try the check-payment function
    try {
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: id }
      });
      
      if (!checkError && checkData?.success) {
        console.log("Successfully used check-payment function:", checkData);
        return {
          success: true,
          status: checkData.status,
          deposit: checkData.deposit,
          message: checkData.message
        };
      } else if (checkError) {
        console.log("check-payment function error:", checkError);
      }
    } catch (error) {
      console.log("check-payment function not available or error:", error);
    }
    
    // Search for deposit in database
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('transaction_id', id)
      .maybeSingle();

    if (error) {
      console.error("Error checking deposit by transaction_id:", error);
      return { success: false, error: error.message };
    }
    
    if (deposit) {
      console.log(`Found deposit with transaction_id ${id}, status: ${deposit.status}`);
      
      if (deposit.status !== 'completed') {
        console.log(`Deposit ${deposit.id} has status ${deposit.status}, attempting to process...`);
        const processResult = await processDepositBalance(deposit.id);
        console.log("Processing result:", processResult);
        
        if (processResult.success) {
          const { data: updatedDeposit } = await supabase
            .from('deposits')
            .select('*')
            .eq('id', deposit.id)
            .single();
            
          if (updatedDeposit) {
            return { 
              success: true, 
              status: updatedDeposit.status,
              deposit: updatedDeposit,
              message: `Deposit found and processed with status: ${updatedDeposit.status}`
            };
          }
        }
      }
      
      return { 
        success: true, 
        status: deposit.status,
        deposit,
        message: `Deposit found with status: ${deposit.status}`
      };
    }
    
    console.log(`No deposit found with transaction_id ${id}, trying to process it directly`);
    const result = await processSpecificTransaction(id);
    return {
      success: result.success,
      status: result.success ? "processed" : "failed",
      error: result.error,
      message: result.message || `Transaction ${result.success ? 'processed' : 'failed to process'}`
    };
  } catch (error) {
    console.error("Exception in checkDepositStatus:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error checking deposit" 
    };
  }
};
