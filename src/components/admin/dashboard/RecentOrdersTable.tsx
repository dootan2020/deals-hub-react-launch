
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentOrder {
  id: string;
  user: {
    email: string;
  };
  product: {
    title: string;
  };
  total_price: number;
  created_at: string;
  status: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.user.email}</TableCell>
                <TableCell>{order.product.title}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(order.total_price)}
                </TableCell>
                <TableCell>
                  <span className={
                    order.status === 'completed' ? 'text-green-500' :
                    order.status === 'processing' ? 'text-blue-500' :
                    'text-gray-500'
                  }>
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
