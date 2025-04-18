
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OrderProduct {
  product: string;
}

interface OrderResponse {
  success: string;
  data?: OrderProduct[];
  description?: string;
}

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  
  const fetchOrderData = async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('order-api', {
        body: {
          action: 'check-order',
          orderId
        }
      });

      if (error) throw error;
      setOrderData(data);
      
      if (data.success === 'false' && data.description === 'Order in processing!') {
        // This is actually an expected status for orders that are processing
        console.log('Đơn hàng đang được xử lý');
      }
    } catch (err: any) {
      console.error('Error fetching order data:', err);
      setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép');
    }).catch(err => {
      toast.error('Không thể sao chép văn bản');
      console.error('Failed to copy:', err);
    });
  };
  
  // Auto-retry for processing orders
  useEffect(() => {
    if (orderData?.success === 'false' && 
        orderData?.description === 'Order in processing!' && 
        retries < 5) {
      const timer = setTimeout(() => {
        console.log(`Đang thử lại lần ${retries + 1}/5...`);
        fetchOrderData();
        setRetries(prev => prev + 1);
      }, 5000); // Retry every 5 seconds, up to 5 times
      
      return () => clearTimeout(timer);
    }
  }, [orderData, retries]);
  
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Trạng thái đơn hàng</CardTitle>
            <CardDescription>
              {orderId ? `Mã đơn hàng: ${orderId}` : 'Không tìm thấy mã đơn hàng'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Đang tải thông tin đơn hàng...</p>
                <p className="text-sm text-muted-foreground mt-2">Vui lòng đợi trong giây lát</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : orderData ? (
              <>
                {orderData.success === 'true' && orderData.data ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center flex-col">
                      <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-xl font-medium">Đơn hàng đã hoàn tất</h3>
                      <p className="text-muted-foreground mt-1">Đơn hàng của bạn đã được xử lý và sản phẩm đã sẵn sàng</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h4 className="font-medium mb-2">Sản phẩm của bạn:</h4>
                      <ul className="space-y-2">
                        {orderData.data.map((item, index) => (
                          <li key={index} className="flex justify-between items-center p-2 border-b last:border-b-0">
                            <span className="font-mono break-all mr-2">{item.product}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => copyToClipboard(item.product)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Sao chép
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center flex-col">
                      <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
                      <h3 className="text-xl font-medium">Đơn hàng đang xử lý</h3>
                      <p className="text-muted-foreground mt-1">
                        {orderData.description === 'Order in processing!' 
                          ? 'Đơn hàng của bạn đang được xử lý. Vui lòng kiểm tra lại sau.' 
                          : orderData.description || 'Có lỗi xảy ra với đơn hàng của bạn.'}
                      </p>
                    </div>
                    
                    <Alert>
                      <AlertTitle>Lưu ý</AlertTitle>
                      <AlertDescription>
                        {retries > 0 
                          ? `Đang tự động kiểm tra trạng thái đơn hàng (lần ${retries}/5)...` 
                          : 'Đơn hàng thường được xử lý trong vài phút. Bạn có thể làm mới trang để kiểm tra trạng thái mới nhất.'}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p>Không có thông tin đơn hàng</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Quay lại Trang chủ
            </Button>
            
            {orderId && !isLoading && (
              <Button 
                onClick={fetchOrderData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Làm mới trạng thái
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
