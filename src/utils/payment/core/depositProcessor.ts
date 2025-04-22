import { Database } from "@/integrations/supabase/types";
import { Deposit } from "@/types/deposits";
import { supabase } from "@/integrations/supabase/client";

// Định nghĩa kiểu dữ liệu rõ ràng và tránh đệ quy
export type DepositProcessor = {
  status: string;
  processDeposit: (deposit: Deposit) => Promise<ProcessResult>;
};

export type ProcessResult = {
  success: boolean;
  status: string;
  message: string;
  depositId?: string;
  updatedDeposit?: Partial<Deposit>;
};

export type DepositProcessorOptions = {
  onSuccess?: (result: ProcessResult) => void;
  onError?: (error: Error | unknown) => void;
  userId?: string | null;
};

export const createDepositProcessor = (options?: DepositProcessorOptions): DepositProcessor => {
  // Các hàm xử lý và cài đặt từ options
  const handleSuccess = options?.onSuccess;
  const handleError = options?.onError;
  const userId = options?.userId;

  // Các phương thức nội bộ và helpers
  const log = (message: string, ...args: any[]) => {
    console.log(`[DepositProcessor]: ${message}`, ...args);
  };

  const errorLog = (message: string, ...args: any[]) => {
    console.error(`[DepositProcessor] ERROR: ${message}`, ...args);
  };

  const updateDepositStatus = async (depositId: string, status: string): Promise<ProcessResult | null> => {
    try {
      const { data, error } = await supabase
        .from("deposits")
        .update({ status })
        .eq("id", depositId)
        .select()
        .single();

      if (error) {
        errorLog(`Failed to update deposit status to ${status}:`, error);
        return null;
      }

      log(`Deposit ${depositId} status updated to ${status}`);
      return {
        success: true,
        status: status,
        message: `Deposit status updated to ${status}`,
        depositId: depositId,
        updatedDeposit: data as Deposit,
      };
    } catch (error) {
      errorLog(`Error updating deposit status:`, error);
      return null;
    }
  };

  const processDeposit = async (deposit: Deposit): Promise<ProcessResult> => {
    try {
      // Validate deposit
      if (!deposit.id) {
        throw new Error("Deposit ID is required");
      }

      if (deposit.status !== "pending") {
        throw new Error(`Deposit is not in pending status. Current status: ${deposit.status}`);
      }

      if (!deposit.payment_method) {
        throw new Error("Payment method is required");
      }

      if (!deposit.amount || deposit.amount <= 0) {
        throw new Error("Deposit amount must be greater than zero");
      }

      // Giả định một flow đơn giản để giữ logic
      if (!deposit.id) {
        throw new Error("Deposit ID is required");
      }

      // Cập nhật trạng thái
      const { data, error } = await supabase
        .from("deposits")
        .update({ status: "processing" })
        .eq("id", deposit.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Kết quả thành công
      const result: ProcessResult = {
        success: true,
        status: "processing",
        message: "Deposit processing started",
        depositId: deposit.id,
        updatedDeposit: data as Deposit,
      };

      // Gọi callback nếu có
      handleSuccess?.(result);
      return result;
    } catch (error) {
      // Xử lý lỗi
      const errorResult: ProcessResult = {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        depositId: deposit.id,
      };
      
      handleError?.(error);
      return errorResult;
    }
  };

  return {
    status: "ready",
    processDeposit,
  };
};

export default createDepositProcessor;
