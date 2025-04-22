
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportToExcel, formatOrderForExport } from "@/utils/exportUtils";

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
  const handleExport = () => {
    const exportData = orders.map(formatOrderForExport);
    exportToExcel(exportData, `orders-export-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Đơn hàng gần đây</CardTitle>
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Xuất Excel
        </Button>
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
