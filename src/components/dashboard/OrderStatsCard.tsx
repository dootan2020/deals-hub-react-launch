import { ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface OrderStatsCardProps {
  processing: number;
  total: number;
}

const OrderStatsCard = ({ processing, total }: OrderStatsCardProps) => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-50/50 hover:border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Đơn hàng đang xử lý</CardTitle>
        <ShoppingCart className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{processing}</div>
        <p className="text-xs text-muted-foreground">Trên tổng số {total} đơn hàng</p>
      </CardContent>
    </Card>
  );
};

export default OrderStatsCard;
