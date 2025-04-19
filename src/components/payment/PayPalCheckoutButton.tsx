
import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2 } from 'lucide-react';
import { createDepositRecord, updateDepositWithTransaction } from '@/utils/paymentUtils';
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
  const { user } = useAuth();
  
  // Check if the amount is valid before showing the PayPal button
  const isValidAmount = !isNaN(amount) && amount >= 1;
  
  // Fetch PayPal client ID from environment
  useEffect(() => {
    const fetchPayPalClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-config', {
          body: { key: 'PAYPAL_CLIENT_ID' }
        });
        
        if (error) {
          console.error('Error fetching PayPal Client ID:', error);
          return;
        }
        
        if (data?.value) {
          setPaypalClientId(data.value);
          console.log("PayPal Client ID retrieved successfully");
        } else {
          console.error('PayPal Client ID not found');
        }
      } catch (error) {
        console.error('Failed to fetch PayPal Client ID:', error);
      }
    };
    
    fetchPayPalClientId();
  }, []);
  
  useEffect(() => {
    // Reset state when amount changes
    if (!isValidAmount) {
      setIsShowPayPal(false);
    }
  }, [amount, isValidAmount]);
  
  const handlePayPalClick = () => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để nạp tiền");
      return;
    }

    if (!isValidAmount) {
      toast.error("Vui lòng nhập số tiền hợp lệ (tối thiểu $1.00)");
      return;
    }

    setIsShowPayPal(true);
  };

  // If PayPal Client ID is not available yet, show a loading state
  if (isShowPayPal && !paypalClientId) {
    return (
      <div className="flex items-center justify-center py-6 border border-gray-200 rounded-md p-4 bg-white">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Đang kết nối với PayPal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isShowPayPal ? (
        <Button 
          onClick={handlePayPalClick} 
          disabled={disabled || !isValidAmount}
          className="w-full flex items-center justify-center py-6"
          size="lg"
        >
          <DollarSign className="mr-2" />
          Thanh toán bằng PayPal
        </Button>
      ) : (
        <div className="border border-gray-200 rounded-md p-4 bg-white">
          <PayPalScriptProvider options={{ 
            clientId: paypalClientId,
            currency: "USD",
            intent: "capture",
            components: "buttons",
            'enable-funding': "paylater,venmo,card"
          }}>
            <PayPalButtons 
              style={{
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
              }}
              disabled={disabled || isProcessing}
              forceReRender={[amount.toString()]}
              createOrder={async (data, actions) => {
                try {
                  setIsProcessing(true);
                  console.log("Creating deposit record for user:", user?.id);
                  
                  // First create a deposit record
                  const newDepositId = await createDepositRecord(user?.id!, amount);
                  
                  if (!newDepositId) {
                    toast.error("Không thể tạo giao dịch. Vui lòng thử lại.");
                    setIsProcessing(false);
                    throw new Error("Failed to create deposit record");
                  }
                  
                  console.log("Deposit record created with ID:", newDepositId);
                  setDepositId(newDepositId);
                  
                  // Create PayPal order
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD",
                          value: amount.toString()
                        },
                        description: "Nạp tiền vào tài khoản Digital Deals Hub",
                        custom_id: newDepositId
                      }
                    ],
                    application_context: {
                      shipping_preference: "NO_SHIPPING"
                    }
                  });
                } catch (error) {
                  console.error("Error creating PayPal order:", error);
                  toast.error("Không thể tạo đơn hàng PayPal. Vui lòng thử lại sau.");
                  setIsProcessing(false);
                  throw error;
                }
              }}
              onApprove={(data, actions) => {
                toast.loading("Đang xử lý giao dịch...");
                console.log("PayPal order approved:", data.orderID);
                
                return actions.order!.capture().then(async (details) => {
                  try {
                    const transactionId = data.orderID;
                    console.log("PayPal transaction captured:", transactionId);
                    console.log("Transaction details:", details);
                    
                    if (!depositId) {
                      toast.error("Không tìm thấy thông tin giao dịch");
                      setIsProcessing(false);
                      return;
                    }
                    
                    console.log("Updating deposit record with transaction ID:", transactionId);
                    const updated = await updateDepositWithTransaction(depositId, transactionId);
                    
                    if (updated) {
                      toast.dismiss();
                      toast.success("Thanh toán thành công! Số dư của bạn sẽ được cập nhật trong vài giây.");
                      onSuccess();
                    } else {
                      toast.dismiss();
                      toast.error("Thanh toán thành công nhưng không thể cập nhật thông tin giao dịch.");
                    }
                  } catch (error) {
                    console.error("Error processing PayPal approval:", error);
                    toast.dismiss();
                    toast.error("Có lỗi xảy ra khi xử lý giao dịch.");
                  } finally {
                    setIsProcessing(false);
                  }
                });
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
