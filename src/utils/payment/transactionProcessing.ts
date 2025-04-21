
import { supabase } from '@/integrations/supabase/client';
import { processDepositBalance } from './balanceProcessing';
import { toast } from 'sonner';

/**
 * Force process a specific PayPal transaction to update user balance
 */
export const processSpecificTransaction = async (
  transactionId: string
): Promise<{ success: boolean, error?: string, message?: string }> => {
  try {
    console.log(`Manually processing specific transaction: ${transactionId}`);
    
    if (!transactionId) {
      return { success: false, error: "Transaction ID is required" };
    }
    
    // Added retry logic for better reliability
    let retryCount = 0;
    const maxRetries = 2;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        // First, try the new check-payment function
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-payment', {
          body: { transaction_id: transactionId }
        });
        
        if (!checkError && checkData?.success) {
          console.log("Transaction checked successfully:", checkData);
          return {
            success: true,
            message: checkData.message
          };
        }
        
        // Use the improved paypal-webhook endpoint
        const { data, error } = await supabase.functions.invoke('paypal-webhook', {
          body: { transaction_id: transactionId }
        });

        if (error) {
          console.error("Error processing transaction:", error);
          // Try as order_id instead of transaction_id
          const { data: orderData, error: orderError } = await supabase.functions.invoke('paypal-webhook', {
            body: { order_id: transactionId }
          });
          
          if (orderError) {
            console.error("Error processing order:", orderError);
            throw new Error(`Failed to process: ${error.message}, ${orderError.message}`);
          }
          
          console.log("Order processing result:", orderData);
          return { 
            success: orderData?.success || false, 
            message: orderData?.message,
            error: orderData?.error 
          };
        }
        
        console.log("Transaction processing result:", data);
        return { 
          success: data?.success || false, 
          message: data?.message,
          error: data?.error 
        };
      } catch (retryError) {
        lastError = retryError;
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} failed, retrying...`, retryError);
        // Wait before retrying (exponential backoff)
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
    
    // If we've exhausted retries, try direct database approach
    console.log("API calls exhausted, trying direct database operation");
    return await processDepositBalance(transactionId);
    
  } catch (error) {
    console.error("Exception in processSpecificTransaction:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error processing transaction" 
    };
  }
};

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
    let { data: deposit, error } = await supabase
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
      
      // Use our new retry functionality if deposit isn't completed
      if (deposit.status !== 'completed') {
        console.log(`Deposit ${deposit.id} has status ${deposit.status}, attempting to process...`);
        
        // Use the new paypal-webhook function
        const { data: retryData, error: retryError } = await supabase.functions.invoke('paypal-webhook', {
          body: { transaction_id: deposit.transaction_id }
        });
        
        if (retryError) {
          console.error("Error retrying deposit:", retryError);
        } else if (retryData && retryData.success) {
          console.log("Successfully processed deposit via webhook:", retryData);
          
          // Get updated deposit
          const { data: updatedDeposit } = await supabase
            .from('deposits')
            .select('*')
            .eq('id', deposit.id)
            .single();
            
          if (updatedDeposit) {
            deposit = updatedDeposit;
            console.log("Updated deposit after processing:", deposit);
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

/**
 * Kiểm tra và xử lý tất cả các giao dịch đang pending
 */
export const processPendingTransactions = async (): Promise<{ 
  success: boolean, 
  processed: number, 
  failed: number,
  error?: string 
}> => {
  try {
    console.log("Starting to process all pending transactions");
    
    // Use the new retry-pending-deposits function
    const { data, error } = await supabase.functions.invoke('retry-pending-deposits');
    
    if (error) {
      console.error("Error invoking retry-pending-deposits:", error);
      toast.error("Không thể xử lý các giao dịch chờ xử lý");
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message
      };
    }
    
    if (data.processed > 0) {
      toast.success(`Đã xử lý thành công ${data.processed} giao dịch`);
    } else if (data.depositIds?.length === 0) {
      toast("Không có giao dịch nào cần xử lý lại");
    }
    
    if (data.failed > 0) {
      toast.error(`${data.failed} giao dịch không thể xử lý lại`);
    }
    
    return {
      success: data.success,
      processed: data.processed,
      failed: data.failed,
      error: data.error
    };
  } catch (error) {
    console.error("Exception in processPendingTransactions:", error);
    toast.error(error instanceof Error ? error.message : "Lỗi không xác định khi xử lý giao dịch");
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : "Unknown error processing pending transactions"
    };
  }
};
