
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Deposit, PendingDepositsStatus } from '@/types/deposits';
import { DepositStatusRPCResponse } from '@/types/fixedTypes';

/**
 * Kiểm tra và xử lý lại các giao dịch đang chờ xử lý
 */
export const checkAndRetryPendingDeposits = async (): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('retry-pending-deposits');

    if (error) {
      console.error("Error invoking retry function:", error);
      toast.error("Không thể xử lý lại các giao dịch đang chờ");
      return {
        success: false,
        processed: 0,
        failed: 0,
        error: error.message || "Unknown error"
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
  } catch (err) {
    console.error("Exception in checkAndRetryPendingDeposits:", err);
    toast.error(err instanceof Error ? err.message : "Lỗi không xác định khi xử lý giao dịch");
    return {
      success: false,
      processed: 0,
      failed: 0,
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
};

/**
 * Lấy thông tin về trạng thái các giao dịch đang chờ xử lý
 */
export const getPendingDepositsStatus = async (): Promise<PendingDepositsStatus> => {
  try {
    // Use proper typing for RPC call with expected return type
    const { data, error } = await supabase
      .rpc('get_pending_deposits_status');
    
    if (error || !data) {
      console.error("Error getting pending deposits status:", error);
      return {
        total_pending: 0,
        needs_retry: 0,
        processed_today: 0,
        failed_today: 0
      };
    }
    
    // Safely handle the response data
    const result: PendingDepositsStatus = {
      total_pending: data.total_pending ?? 0,
      needs_retry: data.needs_retry ?? 0,
      processed_today: data.processed_today ?? 0,
      failed_today: data.failed_today ?? 0
    };
    
    return result;
  } catch (err) {
    console.error("Exception in getPendingDepositsStatus:", err);
    return {
      total_pending: 0,
      needs_retry: 0,
      processed_today: 0,
      failed_today: 0
    };
  }
};

/**
 * Retry một giao dịch cụ thể
 */
export const retrySpecificDeposit = async (deposit: Deposit): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> => {
  try {
    if (!deposit.id) {
      return { success: false, error: "Giao dịch không hợp lệ" };
    }

    const transactionId = deposit.transaction_id;
    
    if (!transactionId) {
      toast.info("Giao dịch không có mã giao dịch PayPal, không thể xử lý lại");
      return { success: false, error: "Không có mã giao dịch PayPal" };
    }
    
    toast.loading(`Đang xử lý lại giao dịch ${transactionId}`);
    
    const { data, error } = await supabase.functions.invoke('paypal-webhook', {
      body: { transaction_id: transactionId }
    });
    
    if (error) {
      console.error("Error retrying deposit:", error);
      toast.error(`Không thể xử lý lại: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    if (data.success) {
      toast.success("Giao dịch đã được xử lý lại thành công");
      return { success: true, message: data.message };
    } else {
      toast.error(data.error || "Xử lý lại không thành công");
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.error("Exception in retrySpecificDeposit:", err);
    toast.error("Lỗi không xác định khi xử lý lại giao dịch");
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Lỗi không xác định" 
    };
  }
};

export default {
  checkAndRetryPendingDeposits,
  getPendingDepositsStatus,
  retrySpecificDeposit
};
