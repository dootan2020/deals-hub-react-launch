
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHistoryItem } from '@/types';

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            product_id,
            qty,
            total_price,
            status,
            keys,
            product:products(title)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Không thể tải lịch sử đơn hàng');
          return;
        }
        
        setOrders(data as OrderHistoryItem[] || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Đã xảy ra lỗi khi tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'processing':
        return <Badge variant="warning">Đang xử lý</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive">Thất bại</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const copyToClipboard = (text: string, message = 'Đã sao chép!') => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Không thể sao chép'));
  };
  
  const copyAllKeys = (keys: any[]) => {
    const keyTexts = keys.map(key => key.key_content).join('\n');
    copyToClipboard(keyTexts, 'Đã sao chép tất cả các key!');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đơn hàng</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const keys = (order.keys as any[] | null) || [];
            const hasKeys = keys.length > 0;
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/20 pb-2">
                  <div className="flex flex-wrap justify-between items-center">
                    <CardTitle className="text-lg">
                      {order.product?.title || 'Sản phẩm không xác định'}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Mã đơn hàng: {order.id.substring(0, 8)}...
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Số lượng</p>
                      <p className="font-medium">{order.qty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng tiền</p>
                      <p className="font-medium">{formatCurrency(order.total_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày đặt hàng</p>
                      <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  
                  {hasKeys && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Key sản phẩm</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyAllKeys(keys)}
                          className="text-xs flex items-center"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Sao chép tất cả
                        </Button>
                      </div>
                      <div className="space-y-2 mt-3">
                        {keys.map((key, index) => (
                          <div key={index} className="flex justify-between items-center bg-secondary/10 p-2 rounded-md text-sm">
                            <code className="font-mono truncate max-w-[70%]">{key.key_content}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.key_content)}
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          <p className="mt-1">Khi bạn mua sản phẩm, đơn hàng sẽ hiển thị ở đây.</p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
