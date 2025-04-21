
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  dailyData: RevenueData[];
  weeklyData: RevenueData[];
  monthlyData: RevenueData[];
  isLoading?: boolean;
}

export const RevenueChart = ({ dailyData, weeklyData, monthlyData, isLoading = false }: RevenueChartProps) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const data = period === 'daily' ? dailyData : period === 'weekly' ? weeklyData : monthlyData;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Doanh thu</CardTitle>
        <CardDescription>
          Biểu đồ doanh thu theo thời gian
        </CardDescription>
        <Tabs defaultValue="daily" className="w-fit" onValueChange={(value) => setPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="daily">Hôm nay</TabsTrigger>
            <TabsTrigger value="weekly">Tuần này</TabsTrigger>
            <TabsTrigger value="monthly">Tháng này</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ChartContainer config={{ revenue: { color: "#2ECC71" }, orders: { color: "#3498DB" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (period === 'monthly') {
                      return value.slice(5); // MM-DD format
                    } else if (period === 'weekly') {
                      return value.slice(5); // MM-DD format
                    }
                    return value.slice(11, 16); // HH:MM format for daily
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)} 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent 
                          className="bg-background border-border shadow-lg"
                          payload={payload}
                          formatter={(value, name) => {
                            if (name === 'revenue') {
                              return formatCurrency(value as number);
                            } else {
                              return `${value} đơn`;
                            }
                          }}
                          nameKey="name"
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu" 
                  stroke="#2ECC71" 
                  strokeWidth={2}
                  dot={{ strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  name="Đơn hàng" 
                  stroke="#3498DB" 
                  strokeWidth={2}
                  yAxisId={1}
                  dot={{ strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
