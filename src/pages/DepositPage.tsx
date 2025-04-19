
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Wallet, RefreshCw, ArrowRight, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Define the props interface for the component
interface DepositPageProps {
  method?: 'binance' | 'usdt' | 'paypal';
}

const DepositPage = ({ method }: DepositPageProps) => {
  const navigate = useNavigate();
  const { userBalance } = useAuth();
  
  // Set the initial payment method based on the route param if provided
  useEffect(() => {
    if (method) {
      navigate(`/deposit/${method}`);
    }
  }, [method, navigate]);

  const paymentMethods = [
    { 
      id: 'binance', 
      name: 'Ngân hàng (Binance)', 
      description: 'Thanh toán qua chuyển khoản ngân hàng thông qua Binance',
      icon: Wallet 
    },
    { 
      id: 'usdt', 
      name: 'Cryptocurrency (USDT)', 
      description: 'Nạp tiền bằng USDT qua mạng lưới Tron hoặc BSC',
      icon: RefreshCw 
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      description: 'Thanh toán trực tuyến nhanh chóng và an toàn qua PayPal',
      icon: CreditCard 
    }
  ];

  const handleSelectMethod = (methodId: string) => {
    navigate(`/deposit/${methodId}`);
  };

  return (
    <Layout>
      <Helmet>
        <title>Nạp tiền | Digital Deals Hub</title>
        <meta name="description" content="Nạp tiền vào tài khoản Digital Deals Hub của bạn" />
      </Helmet>
      
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Nạp tiền vào tài khoản</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Panel - Payment Methods */}
            <div className="md:col-span-2 space-y-5">
              <p className="text-lg mb-6">Vui lòng chọn phương thức nạp tiền:</p>
              
              {paymentMethods.map((method) => (
                <Card 
                  key={method.id}
                  className="overflow-hidden hover:border-primary transition-colors cursor-pointer"
                  onClick={() => handleSelectMethod(method.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start p-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{method.name}</h3>
                        <p className="text-text-light mt-1">{method.description}</p>
                      </div>
                      <div className="ml-auto">
                        <ArrowRight className="h-5 w-5 text-text-light" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Right Panel - Info */}
            <div className="md:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Số dư hiện tại</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(userBalance)}</p>
                  <p className="text-sm text-text-light mt-1">Có sẵn để mua hàng</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <RefreshCw className="h-5 w-5 text-green-500 mt-1 mr-2" />
                    <div>
                      <h3 className="font-semibold">Cập nhật tức thì</h3>
                      <p className="text-sm text-text-light">Tiền sẽ được cộng vào tài khoản của bạn ngay sau khi thanh toán thành công.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Bạn cần giúp đỡ?</h3>
                  <p className="text-sm text-text-light mb-3">
                    Liên hệ đội hỗ trợ nếu bạn có bất kỳ câu hỏi nào về việc nạp tiền.
                  </p>
                  <a 
                    href="/support" 
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Liên hệ Hỗ trợ
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DepositPage;
