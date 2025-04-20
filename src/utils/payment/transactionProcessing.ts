
import { supabase } from '@/integrations/supabase/client';
import { processDepositBalance } from './balanceProcessing';

/**
 * Force process a specific PayPal transaction to update user balance
 */
export const processSpecificTransaction = async (
  transactionId: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log(`Manually processing specific transaction: ${transactionId}`);
    
    if (!transactionId) {
      return { success: false, error: "Transaction ID is required" };
    }
    
    try {
      // Đầu tiên, thử gọi hàm check-payment mới
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: transactionId }
      });
      
      if (!checkError && checkData?.success) {
        console.log("Transaction checked successfully:", checkData);
        return {
          success: true,
          error: checkData.message
        };
      }
      
      // Nếu không có check-payment hoặc failed, tiếp tục với webhook cũ
      const { data, error } = await supabase.functions.invoke('paypal-webhook', {
        body: { transaction_id: transactionId }
      });

      if (error) {
        console.error("Error processing transaction:", error);
        const { data: orderData, error: orderError } = await supabase.functions.invoke('paypal-webhook', {
          body: { order_id: transactionId }
        });
        
        if (orderError) {
          console.error("Error processing order:", orderError);
          return { success: false, error: `Failed to process: ${error.message}, ${orderError.message}` };
        }
        
        console.log("Order processing result:", orderData);
        return { 
          success: orderData?.success || false, 
          error: orderData?.error || orderData?.message
        };
      }
      
      console.log("Transaction processing result:", data);
      return { 
        success: data?.success || false, 
        error: data?.error || data?.message
      };
    } catch (innerError) {
      console.error("Exception in API calls:", innerError);
      
      // Fallback to direct database operation if APIs fail
      return await processDepositBalance(transactionId);
    }
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
): Promise<{ success: boolean, status?: string, deposit?: any, error?: string }> => {
  try {
    console.log(`Checking deposit status for ID: ${id}`);
    
    if (!id) {
      return { success: false, error: "ID is required" };
    }
    
    // Đầu tiên, thử gọi hàm check-payment mới
    try {
      const { data: checkData, error: checkError } = await supabase.functions.invoke('check-payment', {
        body: { transaction_id: id }
      });
      
      if (!checkError && checkData?.success) {
        return {
          success: true,
          status: checkData.status,
          deposit: checkData.deposit
        };
      }
    } catch (error) {
      console.log("check-payment function not yet available or error:", error);
      // Continue with existing logic if check-payment is not available
    }
    
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
      if (deposit.status !== 'completed') {
        await processDepositBalance(deposit.id);
        
        const { data: updatedDeposit } = await supabase
          .from('deposits')
          .select('*')
          .eq('id', deposit.id)
          .single();
          
        if (updatedDeposit) {
          deposit = updatedDeposit;
        }
      }
      
      return { 
        success: true, 
        status: deposit.status,
        deposit
      };
    }
    
    const result = await processSpecificTransaction(id);
    return {
      success: result.success,
      status: "processed",
      error: result.error
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
    // Lấy danh sách các giao dịch pending có transaction_id
    const { data, error } = await supabase
      .from('deposits')
      .select('id, transaction_id')
      .eq('status', 'pending')
      .not('transaction_id', 'is', null);
    
    if (error) {
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message
      };
    }
    
    if (!data || data.length === 0) {
      return {
        success: true,
        processed: 0,
        failed: 0
      };
    }
    
    let processed = 0;
    let failed = 0;
    
    // Xử lý từng giao dịch
    for (const deposit of data) {
      if (!deposit.transaction_id) continue;
      
      const result = await processSpecificTransaction(deposit.transaction_id);
      
      if (result.success) {
        processed++;
      } else {
        failed++;
      }
    }
    
    return {
      success: true,
      processed,
      failed
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: error instanceof Error ? error.message : "Unknown error processing pending transactions"
    };
  }
};
