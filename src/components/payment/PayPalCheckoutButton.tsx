
import { useState, useEffect, useCallback } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, XOctagon, RefreshCw } from 'lucide-react';
import { createDepositRecord, updateDepositWithTransaction } from '@/utils/payment';
import { supabase } from '@/integrations/supabase/client';
import { checkDepositStatus } from '@/utils/payment/transactionProcessing';
import { useBalanceListener } from '@/hooks/use-balance-listener';

interface PayPalCheckoutButtonProps {
  amount: number;
  onSuccess: () => void;
  disabled?: boolean;
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({ 
  amount,
  onSuccess,
  disabled = false 
}) => {
  const [isShowPayPal, setIsShowPayPal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, refreshUserBalance } = useAuth();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const isValidAmount = !isNaN(amount) && amount >= 1;
  
  // Sử dụng balance listener để cập nhật số dư theo thời gian thực
  useBalanceListener(user?.id, () => {
    console.log("Balance updated from realtime notification");
    refreshUserBalance();
  });
  
  // Phương thức kiểm tra trạng thái giao dịch
  const verifyTransaction = useCallback(async (txId: string) => {
    if (!txId) return;
    
    setIsVerifying(true);
    try {
      const toastId = toast.loading("Đang kiểm tra trạng thái giao dịch...");
      
      const result = await checkDepositStatus(txId);
      toast.dismiss(toastId);
      
      if (result.success) {
        toast.success("Giao dịch đã được xác nhận thành công");
        // Refresh user balance sau khi xác nhận giao dịch
        await refreshUserBalance();
        return true;
      } else {
        toast.error(`Lỗi khi kiểm tra giao dịch: ${result.error || "Không xác định"}`);
        return false;
      }
    } catch (error) {
      toast.error(`Không thể kiểm tra trạng thái giao dịch: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [refreshUserBalance]);

  // Kiểm tra trạng thái giao dịch tự động khi có transaction ID
  useEffect(() => {
    if (transactionId) {
      const timer = setTimeout(() => {
        verifyTransaction(transactionId);
      }, 3000); // Chờ 3 giây sau khi nhận được transaction ID
      
      return () => clearTimeout(timer);
    }
  }, [transactionId, verifyTransaction]);
  
  useEffect(() => {
    const fetchPayPalClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-config', {
          body: { key: 'PAYPAL_CLIENT_ID' }
        });
        
        if (error) {
          console.error('Error fetching PayPal Client ID:', error);
          setErrorMessage('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
          return;
        }
        
        if (data?.value) {
          setPaypalClientId(data.value);
          console.log("PayPal Client ID retrieved successfully");
        } else {
          console.error('PayPal Client ID not found');
          setErrorMessage('Cấu hình PayPal chưa được thiết lập.');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Lỗi khi kết nối với PayPal. Vui lòng thử lại sau.';
        console.error('Failed to fetch PayPal Client ID:', error);
        setErrorMessage(message);
      }
    };
    
    fetchPayPalClientId();
  }, []);
  
  useEffect(() => {
    if (!isValidAmount) {
      setIsShowPayPal(false);
    }
  }, [amount, isValidAmount]);
  
  const handlePayPalClick = () => {
    setErrorMessage(null);
    setPaymentError(null);
    setTransactionId(null);

    if (!user) {
      toast.error("Vui lòng đăng nhập để nạp tiền");
      return;
    }

    if (!isValidAmount) {
      toast.error("Vui lòng nhập số tiền hợp lệ (tối thiểu $1.00)");
      return;
    }

    setIsShowPayPal(true);
  };

  const handlePaymentFailure = (msg: string) => {
    setIsProcessing(false);
    setIsShowPayPal(false);
    setPaymentError(msg);
    toast.error(msg);
  };

  // Xử lý nút kiểm tra trạng thái giao dịch
  const handleManualVerify = () => {
    if (transactionId) {
      verifyTransaction(transactionId);
    } else {
      toast.error("Không có thông tin giao dịch để kiểm tra");
    }
  };

  if (isShowPayPal && !paypalClientId) {
    return (
      <div className="flex items-center justify-center py-6 border border-gray-200 rounded-md p-4 bg-white">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Đang kết nối với PayPal...</span>
      </div>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-6 border border-red-200 rounded-md p-4 bg-red-50">
        <div className="text-red-600 mb-3">{errorMessage}</div>
        <Button 
          onClick={() => setErrorMessage(null)}
          variant="outline"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 p-3 rounded-md mb-2">
          <XOctagon className="h-5 w-5 text-red-500" />
          <div>
            <span className="font-bold">Thanh toán thất bại:</span> {paymentError}
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setPaymentError(null)}
          >
            Đóng
          </Button>
        </div>
      )}

      {transactionId && !isShowPayPal && (
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 p-3 rounded-md mb-2">
          <div className="flex-1">
            <span className="font-semibold">Giao dịch đã được ghi nhận:</span> 
            <div className="text-sm mt-1">ID: {transactionId}</div>
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            onClick={handleManualVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang kiểm tra...</>
            ) : (
              <><RefreshCw className="h-4 w-4 mr-2" /> Kiểm tra trạng thái</>
            )}
          </Button>
        </div>
      )}

      {!isShowPayPal ? (
        <Button 
          onClick={handlePayPalClick} 
          disabled={disabled || !isValidAmount || !user}
          className="w-full flex items-center justify-center py-6"
          size="lg"
        >
          <DollarSign className="mr-2" />
          {!user ? 'Vui lòng đăng nhập để nạp tiền' : 'Thanh toán bằng PayPal'}
        </Button>
      ) : (
        <div className="border border-gray-200 rounded-md p-4 bg-white">
          <PayPalScriptProvider options={{ 
            clientId: paypalClientId,
            currency: "USD",
            intent: "capture"
          }}>
            <PayPalButtons 
              style={{
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
              }}
              disabled={disabled || isProcessing || !user}
              forceReRender={[amount.toString()]}
              createOrder={async (data, actions) => {
                try {
                  setIsProcessing(true);

                  if (!user?.id) {
                    throw new Error("Vui lòng đăng nhập để tiếp tục");
                  }

                  const result = await createDepositRecord(user.id, amount);

                  if (!result.success || !result.id) {
                    throw new Error(result.error || "Không thể tạo giao dịch");
                  }

                  setDepositId(result.id);

                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [{
                      amount: {
                        currency_code: "USD",
                        value: amount.toString()
                      },
                      description: "Nạp tiền vào tài khoản Digital Deals Hub",
                      custom_id: result.id
                    }],
                    application_context: {
                      shipping_preference: "NO_SHIPPING"
                    }
                  });
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Lỗi không xác định";
                  handlePaymentFailure(message);
                  throw error;
                }
              }}
              onApprove={async (data, actions) => {
                try {
                  const toastId = toast.loading("Đang xử lý giao dịch...");
                  
                  if (!actions.order) {
                    toast.dismiss(toastId);
                    handlePaymentFailure("Không thể xử lý giao dịch. Thiếu thông tin đơn hàng.");
                    return;
                  }
                  
                  return actions.order.capture().then(async (details) => {
                    try {
                      const transactionId = data.orderID;
                      setTransactionId(transactionId);
                      
                      if (!depositId) {
                        toast.dismiss(toastId);
                        handlePaymentFailure("Không tìm thấy thông tin giao dịch");
                        return;
                      }
                      
                      const updateResult = await updateDepositWithTransaction(depositId, transactionId);

                      if (updateResult.success) {
                        toast.dismiss(toastId);
                        toast.success("Thanh toán thành công! Số dư của bạn đang được cập nhật.");
                        setPaymentError(null);
                        // Thêm timeout để đảm bảo backend đã xử lý cập nhật số dư
                        setTimeout(() => {
                          refreshUserBalance();
                          onSuccess();
                        }, 1500);
                      } else {
                        toast.dismiss(toastId);
                        setIsShowPayPal(false);
                        toast.warning(`Thanh toán đã thành công nhưng đang chờ xử lý: ${updateResult.error || "Vui lòng chờ trong giây lát"}`);
                        // Vẫn gọi onSuccess vì giao dịch đã thành công ở phía PayPal
                        onSuccess();
                      }
                    } catch (error) {
                      toast.dismiss(toastId);
                      const message = error instanceof Error ? error.message : "Unknown error";
                      toast.warning(`Đang kiểm tra trạng thái giao dịch: ${message}`);
                      setIsShowPayPal(false);
                      if (details && details.id) {
                        onSuccess();
                      }
                    } finally {
                      setIsProcessing(false);
                    }
                  });
                } catch (error) {
                  toast.dismiss();
                  const message = error instanceof Error ? error.message : "Unknown error";
                  handlePaymentFailure(`Lỗi xử lý giao dịch PayPal: ${message}`);
                  setIsProcessing(false);
                }
              }}
              onCancel={() => {
                toast.info("Bạn đã hủy quá trình thanh toán.");
                setIsShowPayPal(false);
                setIsProcessing(false);
              }}
              onError={(err) => {
                console.error("PayPal error:", err);
                
                // Fixed error handling to properly type the error
                const errorMessage = typeof err === 'string' 
                  ? err 
                  : err instanceof Error
                    ? err.message
                    : typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
                      ? err.message
                      : "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.";
                
                handlePaymentFailure(errorMessage);
              }}
            />
            {isProcessing && (
              <div className="flex items-center justify-center py-2 text-sm text-gray-500">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Đang khởi tạo giao dịch...
              </div>
            )}
          </PayPalScriptProvider>
        </div>
      )}
    </div>
  );
};
