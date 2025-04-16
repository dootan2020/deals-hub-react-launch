
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  
  const fetchOrderData = async () => {
    if (!orderId) {
      setError('No order ID provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/functions/v1/order-api?action=check-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch order data`);
      }
      
      const data: OrderResponse = await response.json();
      setOrderData(data);
      
      if (data.success === 'false') {
        if (data.description === 'Order in processing!') {
          // This is actually an expected status for orders that are processing
          console.log('Order is still processing');
        } else {
          setError(data.description || 'Unknown error occurred');
        }
      }
    } catch (err: any) {
      console.error('Error fetching order data:', err);
      setError(err.message || 'Failed to fetch order data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      toast.error('Failed to copy text');
      console.error('Failed to copy:', err);
    });
  };
  
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
            <CardTitle className="text-2xl font-bold">Order Status</CardTitle>
            <CardDescription>
              {orderId ? `Order ID: ${orderId}` : 'No order ID provided'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Loading order information...</p>
                <p className="text-sm text-muted-foreground mt-2">Please wait while we check the status of your order</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : orderData ? (
              <>
                {orderData.success === 'true' && orderData.data ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center flex-col">
                      <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                      <h3 className="text-xl font-medium">Order Completed Successfully</h3>
                      <p className="text-muted-foreground mt-1">Your order has been processed and the products are ready</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h4 className="font-medium mb-2">Your Products:</h4>
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
                              Copy
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
                      <h3 className="text-xl font-medium">Order is Processing</h3>
                      <p className="text-muted-foreground mt-1">
                        {orderData.description === 'Order in processing!' 
                          ? 'Your order is still being processed. Please check back soon.' 
                          : orderData.description || 'Something went wrong with your order.'}
                      </p>
                    </div>
                    
                    <Alert>
                      <AlertTitle>Please note</AlertTitle>
                      <AlertDescription>
                        Orders typically process within a few minutes. You can refresh this page to check the latest status.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p>No order information available</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Return to Home
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
                Refresh Status
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;
