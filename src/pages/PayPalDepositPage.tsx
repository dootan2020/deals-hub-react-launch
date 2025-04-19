
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const PAYPAL_CLIENT_ID = "AX0u8TI_V2I9WkqaEuRYIL9a5XPqMXyamnzBtGQ-mf81ZxoAlVhb0ISwoJMHSmbr3F32EOv40ZnQVS_v"; // Replace with your actual client ID

const PayPalDepositPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { user, userBalance } = useAuth();
  const navigate = useNavigate();

  // Predefined amounts for quick selection
  const predefinedAmounts = [10, 25, 50, 100];

  // Validate amount is a positive number
  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return numAmount && numAmount > 0;
  };

  const handleCreateTransaction = async (paypalOrderId: string, paypalAmount: string) => {
    try {
      if (!user) {
        toast.error("Bạn cần đăng nhập để nạp tiền");
        return false;
      }
      
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(paypalAmount),
          status: 'completed',
          type: 'deposit',
          payment_method: 'paypal',
          transaction_id: paypalOrderId
        });

      if (error) {
        console.error("Error creating transaction:", error);
        toast.error("Không thể tạo giao dịch. Vui lòng thử lại sau.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in handleCreateTransaction:", error);
      toast.error("Đã xảy ra lỗi khi xử lý giao dịch");
      return false;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Nạp tiền qua PayPal | Digital Deals Hub</title>
        <meta name="description" content="Nạp tiền vào tài khoản Digital Deals Hub của bạn qua PayPal" />
      </Helmet>
      
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {isSuccess ? (
            <Card className="border-success bg-success/5">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-success" />
                </div>
                <CardTitle className="text-center text-2xl">Nạp tiền thành công!</CardTitle>
                <CardDescription className="text-center">
                  Tài khoản của bạn đã được cộng tiền thành công.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-lg pt-4">
                <p>Số dư hiện tại: <span className="font-bold">{formatCurrency(userBalance)}</span></p>
              </CardContent>
              <CardFooter className="flex justify-center gap-4 pt-4">
                <Button onClick={() => navigate('/deposit')}>Quay lại Nạp tiền</Button>
                <Button onClick={() => navigate('/')}>Về trang chủ</Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-8 flex items-center">
                <Wallet className="mr-3 h-8 w-8 text-primary" />
                Nạp tiền qua PayPal
              </h1>
              
              <Card>
                <CardHeader>
                  <CardTitle>Chọn số tiền cần nạp</CardTitle>
                  <CardDescription>
                    Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Predefined amounts */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {predefinedAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        className={`py-2 border rounded-md transition-colors ${
                          amount === amt.toString() 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-white text-text-light hover:border-primary'
                        }`}
                        onClick={() => setAmount(amt.toString())}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom amount input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hoặc nhập số tiền khác (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  {/* Info box */}
                  <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p>Sau khi thanh toán thành công, số dư sẽ được cập nhật ngay lập tức vào tài khoản của bạn.</p>
                    </div>
                  </div>
                  
                  {/* PayPal buttons */}
                  {isValidAmount() && (
                    <div className="mt-4 pt-4 border-t">
                      <PayPalScriptProvider options={{ 
                        clientId: PAYPAL_CLIENT_ID,
                        currency: "USD",
                        intent: "capture"
                      }}>
                        <PayPalButtons 
                          disabled={isProcessing}
                          forceReRender={[amount]}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [
                                {
                                  amount: {
                                    currency_code: "USD",
                                    value: amount
                                  }
                                }
                              ]
                            });
                          }}
                          onApprove={(data, actions) => {
                            setIsProcessing(true);
                            return actions.order!.capture().then(async (details) => {
                              const name = details.payer.name?.given_name;
                              const transactionId = data.orderID;
                              
                              toast.loading("Đang xác nhận thanh toán...");
                              
                              // Create transaction record in database
                              const success = await handleCreateTransaction(transactionId, amount);
                              
                              if (success) {
                                toast.success(`Cảm ơn ${name}! Thanh toán của bạn đã thành công.`);
                                setIsSuccess(true);
                              } else {
                                toast.error("Không thể xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.");
                              }
                              setIsProcessing(false);
                            });
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
                            setIsProcessing(false);
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PayPalDepositPage;
