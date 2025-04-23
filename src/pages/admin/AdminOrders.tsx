
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle, 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  product_id: string;
  qty: number;
  created_at: string;
  keys: string[];
  user?: {
    email: string;
  };
  product?: {
    title: string;
  };
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id(email),
          product:product_id(title)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Cập nhật trạng thái đơn hàng thành ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setCurrentOrder(order);
    setIsViewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>
            Quản lý tất cả các đơn hàng trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{order.user?.email || 'N/A'}</TableCell>
                        <TableCell>{order.product?.title || 'N/A'}</TableCell>
                        <TableCell>{order.qty}</TableCell>
                        <TableCell>${order.total_price}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        Không có đơn hàng nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và cập nhật trạng thái đơn hàng.
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">ID đơn hàng</p>
                  <p className="font-mono text-sm">{currentOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Ngày tạo</p>
                  <p>{formatDate(currentOrder.created_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Người dùng</p>
                <p>{currentOrder.user?.email || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Sản phẩm</p>
                  <p>{currentOrder.product?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Số lượng</p>
                  <p>{currentOrder.qty}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Tổng tiền</p>
                <p className="text-lg font-bold">${currentOrder.total_price}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Keys</p>
                <div className="p-2 bg-gray-50 rounded border mt-1 max-h-32 overflow-y-auto">
                  {currentOrder.keys && currentOrder.keys.length > 0 ? (
                    <div className="font-mono text-xs break-all space-y-1">
                      {currentOrder.keys.map((key, index) => (
                        <div key={index} className="p-1 bg-white rounded border">{key}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Không có key</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Trạng thái</p>
                <Select
                  value={currentOrder.status}
                  onValueChange={(value) => updateOrderStatus(currentOrder.id, value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pending">Đang chờ</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
