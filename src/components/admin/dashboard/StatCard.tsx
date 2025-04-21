
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  className?: string;
  iconColor?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  isLoading = false,
  trend,
  trendValue,
  className,
  iconColor
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        
        {description && !isLoading && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        
        {trend && trendValue && !isLoading && (
          <div className={cn(
            "flex items-center text-xs mt-2",
            trend === 'up' ? "text-emerald-500" : 
            trend === 'down' ? "text-rose-500" : 
            "text-slate-500"
          )}>
            {trend === 'up' && <span className="mr-1">▲</span>}
            {trend === 'down' && <span className="mr-1">▼</span>}
            {trend === 'flat' && <span className="mr-1">●</span>}
            {trendValue}
          </div>
        )}
        
        {isLoading && description && (
          <Skeleton className="h-4 w-40 mt-1" />
        )}
      </CardContent>
    </Card>
  );
};
