
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersData {
  status: string;
  count: number;
}

interface OrdersChartProps {
  data: OrdersData[];
  isLoading?: boolean;
}

const statusTranslations: Record<string, string> = {
  'completed': 'Hoàn tất',
  'processing': 'Đang xử lý',
  'pending': 'Chờ xử lý',
  'failed': 'Thất bại',
  'canceled': 'Đã hủy'
};

const statusColors: Record<string, string> = {
  'completed': '#2ECC71',
  'processing': '#3498DB',
  'pending': '#F1C40F',
  'failed': '#E74C3C',
  'canceled': '#95A5A6'
};

export const OrdersChart = ({ data, isLoading = false }: OrdersChartProps) => {
  const translatedData = data.map(item => ({
    ...item,
    status: statusTranslations[item.status] || item.status
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái đơn hàng</CardTitle>
        <CardDescription>
          Số lượng đơn hàng theo từng trạng thái
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ChartContainer 
            config={{
              completed: { color: statusColors.completed },
              processing: { color: statusColors.processing },
              pending: { color: statusColors.pending },
              failed: { color: statusColors.failed },
              canceled: { color: statusColors.canceled }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={translatedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          className="bg-background border-border shadow-lg"
                          payload={payload}
                          formatter={(value) => `${value} đơn hàng`}
                          nameKey="status"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Số lượng" 
                  radius={[4, 4, 0, 0]}
                  fill={(data) => {
                    const status = Object.keys(statusTranslations).find(
                      key => statusTranslations[key] === data.status
                    );
                    return status ? statusColors[status] : '#000';
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
