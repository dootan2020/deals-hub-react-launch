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
        
        // If check-payment fails or doesn't exist, try the paypal-webhook function
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
    // Lấy danh sách các giao dịch pending có transaction_id
    const { data, error } = await supabase
      .from('deposits')
      .select('id, transaction_id')
      .eq('status', 'pending')
      .not('transaction_id', 'is', null);

    if (error) {
      console.error("Error fetching pending deposits:", error);
      toast.error("Không thể lấy danh sách giao dịch chờ xử lý");
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      console.log("No pending transactions found");
      toast("Không có giao dịch nào đang chờ xử lý");
      return {
        success: true,
        processed: 0,
        failed: 0
      };
    }

    console.log(`Found ${data.length} pending transactions to process`);
    let processed = 0;
    let failed = 0;

    // Xử lý từng giao dịch
    for (const deposit of data) {
      if (!deposit.transaction_id) continue;

      console.log(`Processing deposit ${deposit.id} with transaction ${deposit.transaction_id}`);
      const result = await processSpecificTransaction(deposit.transaction_id);

      if (result.success) {
        processed++;
        console.log(`Successfully processed deposit ${deposit.id}`);
        toast.success(`Xử lý thành công giao dịch #${deposit.transaction_id}`);
      } else {
        failed++;
        console.error(`Failed to process deposit ${deposit.id}:`, result.error);
        toast.error(result.error || "Không thể xử lý giao dịch");
      }
    }

    console.log(`Processing complete: ${processed} succeeded, ${failed} failed`);
    return {
      success: true,
      processed,
      failed
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
