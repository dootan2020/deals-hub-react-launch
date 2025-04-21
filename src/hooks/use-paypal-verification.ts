
import { useState } from 'react';
import { checkDepositStatus } from '@/utils/payment/transactionProcessing';
import { toast } from 'sonner';

export const usePayPalVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    status?: string;
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const verifyPayment = async (transactionId: string) => {
    if (!transactionId) {
      toast.error("Lỗi xác minh", {
        description: "Không tìm thấy mã giao dịch"
      });
      return null;
    }

    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      console.log(`Verifying payment: ${transactionId}`);
      const result = await checkDepositStatus(transactionId);
      console.log("Verification result:", result);

      setVerificationStatus({
        status: result.status,
        success: result.success,
        message: result.message || undefined,
        error: result.error
      });

      if (result.success) {
        if (result.status === 'completed') {
          toast.success("Xác minh thành công", {
            description: "Giao dịch đã được xác nhận và số dư đã được cập nhật"
          });
        } else if (result.status === 'pending') {
          toast.info("Đang xử lý", {
            description: "Giao dịch đang chờ xử lý từ PayPal"
          });
        } else {
          toast.warning("Cần kiểm tra", {
            description: result.message || "Trạng thái giao dịch không xác định"
          });
        }
      } else {
        toast.error("Lỗi xác minh", {
          description: result.error || "Không thể xác minh giao dịch"
        });
      }

      return result;
    } catch (error) {
      console.error("Payment verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      
      setVerificationStatus({
        status: 'error',
        success: false,
        error: errorMessage
      });
      
      toast.error("Lỗi xác minh", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verificationStatus,
    verifyPayment
  };
};
