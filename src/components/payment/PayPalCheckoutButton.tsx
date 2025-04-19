
import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2 } from 'lucide-react';
import { createDepositRecord, updateDepositWithTransaction } from '@/utils/payment';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  
  const isValidAmount = !isNaN(amount) && amount >= 1;
  
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
        console.error('Failed to fetch PayPal Client ID:', error);
        setErrorMessage('Lỗi khi kết nối với PayPal. Vui lòng thử lại sau.');
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
                  const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
                  toast.error(errorMsg);
                  setIsProcessing(false);
                  setIsShowPayPal(false);
                  throw error;
                }
              }}
              onApprove={async (data, actions) => {
                try {
                  const toastId = toast.loading("Đang xử lý giao dịch...");
                  console.log("PayPal order approved:", data.orderID);
                  
                  if (!actions.order) {
                    toast.error("Không thể xử lý giao dịch. Thiếu thông tin đơn hàng.");
                    setIsProcessing(false);
                    return;
                  }
                  
                  return actions.order.capture().then(async (details) => {
                    try {
                      const transactionId = data.orderID;
                      console.log("PayPal transaction captured:", transactionId);
                      console.log("Transaction details:", details);
                      
                      if (!depositId) {
                        toast.dismiss(toastId);
                        toast.error("Không tìm thấy thông tin giao dịch");
                        setIsProcessing(false);
                        return;
                      }
                      
                      console.log("Updating deposit record with transaction ID:", transactionId);
                      const updateResult = await updateDepositWithTransaction(depositId, transactionId);
                      
                      if (updateResult.success) {
                        toast.dismiss(toastId);
                        toast.success("Thanh toán thành công! Số dư của bạn sẽ được cập nhật trong vài giây.");
                        onSuccess();
                      } else {
                        toast.dismiss(toastId);
                        toast.error(`Thanh toán thành công nhưng không thể cập nhật thông tin giao dịch: ${updateResult.error || "Unknown error"}`);
                        onSuccess();
                      }
                    } catch (error) {
                      console.error("Error processing PayPal approval:", error);
                      toast.dismiss(toastId);
                      
                      const errorMsg = error instanceof Error ? error.message : "Unknown error";
                      toast.error(`Có lỗi xảy ra khi xử lý giao dịch: ${errorMsg}`);
                      
                      if (details && details.id) {
                        onSuccess();
                      }
                    } finally {
                      setIsProcessing(false);
                    }
                  });
                } catch (error) {
                  console.error("Error in onApprove flow:", error);
                  toast.dismiss();
                  const errorMsg = error instanceof Error ? error.message : "Unknown error";
                  toast.error(`Lỗi xử lý giao dịch PayPal: ${errorMsg}`);
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
                toast.error("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
                setIsProcessing(false);
                setIsShowPayPal(false);
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
