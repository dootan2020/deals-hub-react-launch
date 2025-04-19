
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

const PAYPAL_CLIENT_ID = "AX0u8TI_V2I9WkqaEuRYIL9a5XPqMXyamnzBtGQ-mf81ZxoAlVhb0ISwoJMHSmbr3F32EOv40ZnQVS_v";

const calculateFee = (amount: number): number => {
  const feePercentage = 0.039;
  const fixedFee = 0.30;
  return amount * feePercentage + fixedFee;
};

const calculateNetAmount = (amount: number): number => {
  return amount - calculateFee(amount);
};

const PayPalDepositPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const { user, userBalance } = useAuth();
  const navigate = useNavigate();

  const predefinedAmounts = [10, 25, 50, 100];

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    return numAmount && numAmount >= 1;
  };

  const createDepositRecord = async (grossAmount: number): Promise<string | null> => {
    try {
      if (!user) {
        toast.error("Bạn cần đăng nhập để nạp tiền");
        return null;
      }
      
      const netAmount = calculateNetAmount(grossAmount);
      
      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: grossAmount,
          net_amount: netAmount,
          payment_method: 'paypal',
          status: 'pending'
        })
        .select('id')
        .single() as any;

      if (error) {
        console.error("Error creating deposit record:", error);
        toast.error("Không thể tạo giao dịch. Vui lòng thử lại sau.");
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error in createDepositRecord:", error);
      toast.error("Đã xảy ra lỗi khi xử lý giao dịch");
      return null;
    }
  };

  const updateDepositWithTransaction = async (depositId: string, transactionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('deposits')
        .update({
          transaction_id: transactionId
        })
        .eq('id', depositId) as any;

      if (error) {
        console.error("Error updating deposit record:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateDepositWithTransaction:", error);
      return false;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
                  Giao dịch của bạn đang được xử lý. Số dư sẽ được cập nhật trong vài giây.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-lg pt-4">
                <p>Số dư hiện tại: <span className="font-bold">{formatCurrency(userBalance)}</span></p>
                <p className="mt-2 text-sm text-gray-600">Mã giao dịch đã được ghi nhận. Chúng tôi sẽ xác nhận và cập nhật số dư cho bạn ngay sau khi nhận được thông báo từ PayPal.</p>
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
                    {amount && parseFloat(amount) < 1 && (
                      <p className="text-red-500 text-sm mt-1">Số tiền tối thiểu là $1.00</p>
                    )}
                  </div>
                  
                  {isValidAmount() && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Chi tiết thanh toán</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Số tiền nạp:</span>
                          <span>${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Phí PayPal:</span>
                          <span>-${calculateFee(parseFloat(amount)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                          <span>Số tiền thực nhận:</span>
                          <span>${calculateNetAmount(parseFloat(amount)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p>Sau khi thanh toán thành công, số dư sẽ được cập nhật ngay lập tức vào tài khoản của bạn.</p>
                    </div>
                  </div>
                  
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
                          createOrder={async (data, actions) => {
                            const newDepositId = await createDepositRecord(parseFloat(amount));
                            
                            if (!newDepositId) {
                              toast.error("Không thể tạo giao dịch. Vui lòng thử lại.");
                              throw new Error("Failed to create deposit record");
                            }
                            
                            setDepositId(newDepositId);
                            
                            return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [
                                {
                                  amount: {
                                    currency_code: "USD",
                                    value: amount
                                  },
                                  description: "Nạp tiền vào tài khoản Digital Deals Hub",
                                  custom_id: newDepositId
                                }
                              ],
                              application_context: {
                                shipping_preference: "NO_SHIPPING"
                              }
                            });
                          }}
                          onApprove={(data, actions) => {
                            setIsProcessing(true);
                            toast.loading("Đang xử lý giao dịch...");
                            
                            return actions.order!.capture().then(async (details) => {
                              const transactionId = data.orderID;
                              
                              if (!depositId) {
                                toast.error("Không tìm thấy thông tin giao dịch");
                                setIsProcessing(false);
                                return;
                              }
                              
                              const updated = await updateDepositWithTransaction(depositId, transactionId);
                              
                              if (updated) {
                                toast.success("Thanh toán thành công! Số dư của bạn sẽ được cập nhật trong vài giây.");
                                setIsSuccess(true);
                              } else {
                                toast.error("Thanh toán thành công nhưng không thể cập nhật thông tin giao dịch.");
                                setIsSuccess(true);
                              }
                              
                              setIsProcessing(false);
                            });
                          }}
                          onCancel={() => {
                            toast.info("Bạn đã hủy quá trình thanh toán.");
                            setIsProcessing(false);
                          }}
                          onError={(err) => {
                            console.error("PayPal error:", err);
                            toast.error("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.");
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
