
import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CompletedOrdersCardProps {
  completed: number;
}

const CompletedOrdersCard = ({ completed }: CompletedOrdersCardProps) => {
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md hover:border-gray-300 hover:bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Đơn hàng đã hoàn thành</CardTitle>
        <Clock className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{completed}</div>
        <p className="text-xs text-muted-foreground">Đơn hàng thành công</p>
      </CardContent>
    </Card>
  );
};

export default CompletedOrdersCard;
