
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useOrderHistory, OrderHistoryItem } from '@/hooks/useOrderHistory.tsx';
import { Loader } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useAuth();
  const { orders, isLoading, error } = useOrderHistory(user?.id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-error">
        {error}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center p-8 text-text-light">
        Bạn chưa có đơn hàng nào
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Số lượng</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Ngày mua</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Key</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: OrderHistoryItem) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.product?.title || 'N/A'}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(order.price * order.quantity)}
              </TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`
                }>
                  {order.status === 'completed' ? 'Hoàn thành' :
                   order.status === 'pending' ? 'Đang xử lý' : 
                   'Thất bại'}
                </span>
              </TableCell>
              <TableCell>
                {order.key_delivered.length > 0 ? (
                  <div className="max-w-xs overflow-hidden text-ellipsis">
                    {order.key_delivered.map((key, index) => (
                      <div key={index} className="text-xs font-mono bg-gray-100 p-1 rounded mb-1">
                        {key}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-light">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderHistory;
