
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PayPalProvider } from '@/components/payment/PayPalProvider';
import { PayPalDetails } from '@/components/payment/PayPalDetails';
import { useNavigate } from 'react-router-dom';
import { PayPalCheckoutButton } from '@/components/payment/PayPalCheckoutButton';
import { Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const predefinedAmounts = [10, 25, 50, 100];

const PayPalDepositPage: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const numAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numAmount) && numAmount >= 1;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    toast.success('Nạp tiền thành công!');
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {isSuccess ? (
            <Card className="border-success bg-success/5">
              <CardHeader>
                <CardTitle className="text-center">Nạp tiền thành công!</CardTitle>
                <CardDescription className="text-center">
                  Giao dịch của bạn đã được xác nhận. Số dư sẽ được cập nhật trong vài giây.
                </CardDescription>
              </CardHeader>
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
                    {amount && !isValidAmount && (
                      <p className="text-red-500 text-sm mt-1">Số tiền tối thiểu là $1.00</p>
                    )}
                  </div>
                  
                  {isValidAmount && (
                    <>
                      <PayPalDetails amount={numAmount} />
                      
                      <div className="flex p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p>Sau khi thanh toán thành công, số dư sẽ được cập nhật ngay lập tức vào tài khoản của bạn.</p>
                        </div>
                      </div>
                      
                      <PayPalProvider>
                        <PayPalCheckoutButton 
                          amount={numAmount} 
                          onSuccess={handlePaymentSuccess}
                        />
                      </PayPalProvider>
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
