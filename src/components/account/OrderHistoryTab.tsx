
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingBag, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { Button } from '@/components/ui/button';
import { useOrderApi } from '@/hooks/use-order-api';
import { toast } from '@/hooks/use-toast';

interface OrderHistoryTabProps {
  userId: string;
}

const OrderHistoryTab = ({ userId }: OrderHistoryTabProps) => {
  const { orders, isLoading, error, refetch } = useOrderHistory(userId);
  const { checkOrder } = useOrderApi();
  const [refreshingOrder, setRefreshingOrder] = React.useState<string | null>(null);

  const renderOrderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Hoàn thành</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Thất bại</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleRefreshOrder = async (externalOrderId: string, orderId: string) => {
    if (!externalOrderId) {
      toast.error('Không tìm thấy mã đơn hàng ngoài hệ thống');
      return;
    }
    
    setRefreshingOrder(orderId);
    
    try {
      await checkOrder({ orderId: externalOrderId });
      toast.success('Đã kiểm tra đơn hàng. Đang cập nhật trạng thái...');
      
      // Đợi 2 giây để cho hệ thống xử lý, sau đó cập nhật lại danh sách
      setTimeout(() => {
        refetch();
        setRefreshingOrder(null);
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi kiểm tra đơn hàng:', error);
      toast.error('Không thể kiểm tra trạng thái đơn hàng');
      setRefreshingOrder(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Đang tải lịch sử đơn hàng...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 p-6">
          <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-500">Chưa có đơn hàng</h3>
          <p className="text-gray-400 text-center mt-2">
            Bạn chưa thực hiện giao dịch mua hàng nào. Khi bạn mua sản phẩm, lịch sử đơn hàng sẽ hiển thị tại đây.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đơn hàng</CardTitle>
        <CardDescription>Xem các đơn hàng và trạng thái của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{order.product_title || 'N/A'}</TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell>{renderOrderStatus(order.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline"
                      size="sm" 
                      disabled={order.status !== 'processing' || !order.external_order_id || refreshingOrder === order.id}
                      onClick={() => handleRefreshOrder(order.external_order_id!, order.id)}
                    >
                      {refreshingOrder === order.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Cập nhật
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.open(`/order-success?orderId=${order.external_order_id}`, '_blank')}
                      disabled={!order.external_order_id}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrderHistoryTab;
