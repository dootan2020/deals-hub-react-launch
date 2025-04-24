
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const VerifiedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const isSuccess = searchParams.get('success') === 'true';
  const errorMessage = searchParams.get('error');
  const errorStatus = searchParams.get('status');

  useEffect(() => {
    console.log('Verified page loaded with params:', {
      success: searchParams.get('success'),
      error: errorMessage,
      status: errorStatus
    });
    
    // Hiển thị toast phù hợp sau khi trang load
    setTimeout(() => {
      if (isSuccess) {
        toast.success(
          "Xác thực thành công",
          "Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ."
        );
      } else if (errorMessage) {
        toast.error(
          "Xác thực thất bại",
          `Lỗi: ${errorMessage}`
        );
      }
      setIsLoading(false);
    }, 1000);
  }, [isSuccess, errorMessage, errorStatus, searchParams]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <Layout title={isSuccess ? "Xác thực thành công" : "Xác thực thất bại"}>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <p className="mt-4 text-lg">Đang xác thực...</p>
              </div>
            ) : isSuccess ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-700 mb-2">Xác thực thành công!</h1>
                <p className="mb-6">Tài khoản của bạn đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.</p>
                
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleLoginClick}>
                    Đăng nhập
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleHomeClick}>
                    Về trang chủ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-2">Xác thực thất bại</h1>
                
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    {errorMessage || "Đã xảy ra lỗi trong quá trình xác thực"}
                    {errorStatus ? ` (${errorStatus})` : ''}
                  </AlertDescription>
                </Alert>
                
                <p className="mb-6">Vui lòng thử đăng nhập hoặc yêu cầu gửi lại email xác thực.</p>
                
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleLoginClick}>
                    Đăng nhập
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleHomeClick}>
                    Về trang chủ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifiedPage;
