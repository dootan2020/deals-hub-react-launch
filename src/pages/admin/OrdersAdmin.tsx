
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, ArrowDownUp, RotateCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useOrderApi } from '@/hooks/use-order-api';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    title: string;
  };
}

interface OrderDetails {
  id: string;
  items: OrderItem[];
  details: {
    status: string;
    external_order_id: string | null;
    created_at: string;
    total_amount: number;
    promotion_code?: string | null;
    updated_at: string;
  };
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const { checkOrder } = useOrderApi();
  
  // Sort state
  const [sortField, setSortField] = useState<'created_at' | 'status' | 'total_amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      
      // Map the data to match the Order interface
      const mappedOrders = (data || []).map(order => ({
        ...order,
        total_amount: order.total_price || 0
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sortField, sortOrder]);

  const toggleSort = (field: 'created_at' | 'status' | 'total_amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = async (orderId: string) => {
    setIsDetailsLoading(true);
    setSelectedOrder(null);
    
    try {
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*, product:products(title)')
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;

      // Get the order details
      const { data: orderDetails, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) throw orderError;

      setSelectedOrder({
        id: orderId,
        items: items || [],
        details: {
          ...orderDetails,
          total_amount: orderDetails.total_price || 0
        }
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCheckOrderStatus = async (externalOrderId: string, orderId: string) => {
    if (!externalOrderId) {
      toast.error('Đơn hàng không có mã tham chiếu ngoài');
      return;
    }
    
    setProcessingOrder(orderId);
    
    try {
      toast.info('Đang kiểm tra trạng thái đơn hàng...');
      
      const result = await checkOrder({ orderId: externalOrderId });
      
      if (result.success === 'true' && result.data) {
        // Update order status in database
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('external_order_id', externalOrderId);
          
        toast.success('Đơn hàng đã hoàn thành!');
      } else if (result.description === 'Order in processing!') {
        toast.info('Đơn hàng vẫn đang được xử lý');
      } else {
        toast.warning(`Trạng thái đơn hàng: ${result.description || 'Không xác định'}`);
      }
      
      // Refresh orders list after check
      fetchOrders();
    } catch (error) {
      console.error('Error checking order:', error);
      toast.error('Không thể kiểm tra trạng thái đơn hàng');
    } finally {
      setProcessingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'processing':
        return <Badge variant="default">Đang xử lý</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                    <div className="flex items-center">
                      Trạng thái
                      {sortField === 'status' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('total_amount')}>
                    <div className="flex items-center">
                      Tổng tiền
                      {sortField === 'total_amount' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('created_at')}>
                    <div className="flex items-center">
                      Ngày tạo
                      {sortField === 'created_at' && (
                        <ArrowDownUp className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="flex justify-center items-center py-4">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Đang tải dữ liệu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{order.external_order_id || '—'}</TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleViewDetails(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">Xem</span>
                          </Button>
                          {order.external_order_id && order.status === 'processing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOrderStatus(order.external_order_id!, order.id)}
                              disabled={processingOrder === order.id}
                            >
                              {processingOrder === order.id ? (
                                <RotateCw className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <RefreshCw className="w-4 h-4 mr-1" />
                              )}
                              Kiểm tra
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          {selectedOrder ? (
            <div className="p-4 border rounded-md">
              <h3 className="mb-4 text-lg font-medium">Chi tiết đơn hàng</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="font-medium">{selectedOrder.id}</p>
              </div>
              
              {selectedOrder.details && (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-medium">{selectedOrder.details.status}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Mã tham chiếu</p>
                    <p className="font-medium">{selectedOrder.details.external_order_id || '—'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">{formatDate(selectedOrder.details.created_at)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="font-medium">${selectedOrder.details.total_amount.toFixed(2)}</p>
                  </div>
                  
                  {selectedOrder.details.promotion_code && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Mã khuyến mãi</p>
                      <p className="font-medium">{selectedOrder.details.promotion_code}</p>
                    </div>
                  )}
                </>
              )}
              
              <h4 className="mt-6 mb-2 font-medium">Danh mục sản phẩm</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-2 border rounded">
                    <p className="font-medium">{item.product?.title || 'Sản phẩm không xác định'}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Số lượng: {item.quantity}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedOrder.details.external_order_id && selectedOrder.details.status === 'processing' && (
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleCheckOrderStatus(selectedOrder.details.external_order_id!, selectedOrder.id)}
                    disabled={processingOrder === selectedOrder.id}
                  >
                    {processingOrder === selectedOrder.id ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin mr-2" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Kiểm tra trạng thái
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : isDetailsLoading ? (
            <div className="p-4 text-center border rounded-md">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Đang tải chi tiết đơn hàng...</p>
            </div>
          ) : (
            <div className="p-4 text-center border rounded-md">
              <p className="text-muted-foreground">Chọn một đơn hàng để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersAdmin;
