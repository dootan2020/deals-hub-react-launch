
import { UserStatsData } from '@/integrations/supabase/types-extension';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserX } from 'lucide-react';

interface UserStatsCardsProps {
  stats: UserStatsData;
  loading: boolean;
  onRefresh: () => void;
}

export const UserStatsCards = ({ stats, loading, onRefresh }: UserStatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.total_users}</div>
          <p className="text-xs text-muted-foreground">Tài khoản đã đăng ký</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng mới (tuần)</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.new_users_week}</div>
          <p className="text-xs text-muted-foreground">7 ngày qua</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng mới (tháng)</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.new_users_month}</div>
          <p className="text-xs text-muted-foreground">30 ngày qua</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tài khoản không hoạt động</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.inactive_users}</div>
          <p className="text-xs text-muted-foreground">Bị khóa hoặc chưa xác thực</p>
        </CardContent>
      </Card>
    </div>
  );
};
