
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  ArrowDownLeft, 
  Loader2,
  Package,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  user_id: string;
  user?: {
    email: string;
  };
  product?: {
    title: string;
  };
  qty: number;
}

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
}

export function OrdersTable({ orders, isLoading, onViewDetails, onStatusChange }: OrdersTableProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await onStatusChange(orderId, newStatus);
      toast.success("Cập nhật trạng thái", `Đơn hàng #${orderId.substring(0, 8)} đã được chuyển sang trạng thái ${newStatus}`);
    } catch (error) {
      toast.error("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Đang xử lý</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Đã hủy</Badge>;
      case 'refunded':
        return <Badge className="bg-amber-500">Đã hoàn tiền</Badge>;
      default:
        return <Badge className="bg-gray-500">Chờ xử lý</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Đang tải danh sách đơn hàng...</span>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>SL</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  {order.product?.title || 'N/A'}
                </TableCell>
                <TableCell>{order.qty}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total_price)}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                    {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'refunded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100"
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Hoàn thành
                      </Button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'refunded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 text-red-600 hover:bg-red-100"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Hủy
                      </Button>
                    )}
                    {order.status !== 'refunded' && order.status !== 'processing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                        onClick={() => handleStatusChange(order.id, 'refunded')}
                        disabled={updatingOrderId === order.id}
                      >
                        {updatingOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 mr-1" />
                        )}
                        Hoàn tiền
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12 mb-2 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">Không có đơn hàng</h3>
                  <p>Chưa có đơn hàng nào trong hệ thống.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Thông tin đơn hàng</h3>
              <div className="bg-muted/40 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span>{getStatusBadge(selectedOrder?.status || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số lượng:</span>
                  <span>{selectedOrder?.qty || 0}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Tổng tiền:</span>
                  <span>{selectedOrder?.total_price ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(selectedOrder.total_price) : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Thông tin khách hàng</h3>
              <div className="bg-muted/40 p-4 rounded-md">
                <p><span className="text-muted-foreground">ID khách hàng:</span> {selectedOrder?.user_id || 'N/A'}</p>
                <p><span className="text-muted-foreground">Email:</span> {selectedOrder?.user?.email || 'N/A'}</p>
              </div>
              
              <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-1">Thông tin sản phẩm</h3>
              <div className="bg-muted/40 p-4 rounded-md">
                <p>{selectedOrder?.product?.title || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Đóng
            </Button>
            {selectedOrder?.status !== 'completed' && selectedOrder?.status !== 'cancelled' && selectedOrder?.status !== 'refunded' && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  handleStatusChange(selectedOrder?.id || '', 'completed');
                  setIsDetailsOpen(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Xác nhận hoàn thành
              </Button>
            )}
            {selectedOrder?.status !== 'refunded' && selectedOrder?.status !== 'processing' && (
              <Button 
                variant="destructive"
                onClick={() => {
                  handleStatusChange(selectedOrder?.id || '', 'refunded');
                  setIsDetailsOpen(false);
                }}
              >
                <ArrowDownLeft className="h-4 w-4 mr-1" />
                Hoàn tiền
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OrdersTable;
