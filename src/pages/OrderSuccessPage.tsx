import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  Download,
  Home,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useOrderApi } from '@/hooks/use-order-api';
import { createInvoiceFromOrder } from '@/components/account/invoice-utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/integrations/supabase/types-extension';

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
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  
  const { checkOrder } = useOrderApi();
  const { user } = useAuth();
  
  const fetchOrderData = async () => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await checkOrder({ orderId });
      setOrderData(result);
      
      if (result.success === 'true' && user?.id) {
        await createOrderInvoice(orderId);
      }
      
    } catch (err: any) {
      console.error('Error fetching order data:', err);
      setError(err.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrderInvoice = async (orderId: string) => {
    if (!user?.id) return;

    try {
      setIsInvoiceLoading(true);

      const { data: existingInvoice, error: checkError } = await supabase
        .from('invoices')
        .select('id')
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingInvoice && existingInvoice.id) {
        setInvoiceId(existingInvoice.id);
        return;
      }

      const { data: orderDetails, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError) {
        console.error("Error fetching order details:", orderError);
        return;
      }

      const { data, error: invoiceError } = await supabase.functions.invoke('create-invoice', {
        body: { orderId }
      });

      if (data?.invoice?.id) {
        setInvoiceId(data.invoice.id);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const downloadTxt = () => {
    if (!orderData?.data) return;
    
    const content = orderData.data
      .map((item, index) => `${index + 1}. ${item.product}`)
      .join('\n');
      
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Đã tải xuống danh sách sản phẩm');
  };
  
  const copyAllProducts = () => {
    if (!orderData?.data) return;
    
    const content = orderData.data
      .map((item, index) => `${index + 1}. ${item.product}`)
      .join('\n');
      
    navigator.clipboard.writeText(content)
      .then(() => toast.success('Đã sao chép tất cả sản phẩm'))
      .catch(() => toast.error('Không thể sao chép'));
  };
  
  const copyProduct = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Đã sao chép'))
      .catch(() => toast.error('Không thể sao chép'));
  };
  
  const viewInvoice = () => {
    if (invoiceId && user) {
      window.open(`/account?tab=invoices`, '_blank');
    }
  };
  
  useEffect(() => {
    if (orderData?.success === 'false' && 
        orderData?.description === 'Order in processing!' && 
        retries < 5) {
      const timer = setTimeout(() => {
        console.log(`Đang thử lại lần ${retries + 1}/5...`);
        fetchOrderData();
        setRetries(prev => prev + 1);
      }, 5000);
      
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
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
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
                      <p className="text-muted-foreground mt-1">
                        Đơn hàng của bạn đã được xử lý và sản phẩm đã sẵn sàng
                      </p>
                    </div>
                    
                    <Card className="border-2">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg">Sản phẩm của bạn</CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copyAllProducts}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép tất cả
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={downloadTxt}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải về .TXT
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                          <ol className="space-y-4 list-decimal list-inside">
                            {orderData.data.map((item, index) => (
                              <li key={index} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                                <span className="font-mono break-all mr-2">{item.product}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => copyProduct(item.product)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ol>
                        </ScrollArea>
                        
                        <Alert className="mt-4" variant="default">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <AlertDescription>
                            Đơn hàng này sẽ được xóa sau 48 giờ. Vui lòng lưu lại thông tin sản phẩm trước khi đơn hàng hết hạn.
                          </AlertDescription>
                        </Alert>

                        {user && invoiceId && (
                          <Alert className="mt-4 bg-green-50 border-green-200">
                            <FileText className="h-4 w-4 text-green-500" />
                            <AlertDescription className="flex items-center justify-between">
                              <span>Hóa đơn đã được tạo cho đơn hàng này.</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={viewInvoice} 
                                className="ml-2"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem hóa đơn
                              </Button>
                            </AlertDescription>
                          </Alert>
                        )}

                        {user && !invoiceId && (
                          <div className="mt-4 flex justify-center">
                            {isInvoiceLoading ? (
                              <div className="text-center">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                                <span className="text-sm text-muted-foreground">Đang tạo hóa đơn...</span>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                onClick={() => createOrderInvoice(orderId || '')}
                                className="mx-auto"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Tạo hóa đơn
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
          
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Quay về trang chủ
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
            
            {user && (
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/account?tab=invoices'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Lịch sử hóa đơn
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
