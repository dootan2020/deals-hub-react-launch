
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PayPalDetails } from '@/components/payment/PayPalDetails';
import { PayPalCheckoutButton } from '@/components/payment/PayPalCheckoutButton';

const PAYPAL_CLIENT_ID = "AX0u8TI_V2I9WkqaEuRYIL9a5XPqMXyamnzBtGQ-mf81ZxoAlVhb0ISwoJMHSmbr3F32EOv40ZnQVS_v";

// These functions are now moved to a utility file
import { calculateFee, calculateNetAmount } from '@/utils/paymentUtils';

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
    return !isNaN(numAmount) && numAmount >= 1;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
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
                    Chọn số tiền hoặc nhập số tiền tùy chỉnh để nạp vào tài khoản.
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
                    {amount && parseFloat(amount) < 1 && !isNaN(parseFloat(amount)) && (
                      <p className="text-red-500 text-sm mt-1">Số tiền tối thiểu là $1.00</p>
                    )}
                  </div>
                  
                  {isValidAmount() && (
                    <>
                      <PayPalDetails amount={parseFloat(amount)} />
                      
                      <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p>Sau khi thanh toán thành công, số dư sẽ được cập nhật ngay lập tức vào tài khoản của bạn.</p>
                        </div>
                      </div>
                      
                      <PayPalCheckoutButton 
                        amount={parseFloat(amount)} 
                        onSuccess={handlePaymentSuccess}
                        disabled={isProcessing}
                      />
                      
                      <div className="mt-4 text-center">
                        <Button 
                          className="w-full"
                          disabled={isProcessing}
                          onClick={() => navigate('/deposit')}
                          variant="outline"
                        >
                          Quay lại
                        </Button>
                      </div>
                    </>
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
