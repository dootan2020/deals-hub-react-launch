
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Doanh thu 7 ngày qua</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
              />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: number) => 
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2ECC71"
                fillOpacity={1}
                fill="url(#revenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
