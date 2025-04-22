
import { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { DashboardStatsCards } from '@/components/admin/dashboard/DashboardStatsCards';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { RecentOrdersTable } from '@/components/admin/dashboard/RecentOrdersTable';
import { DateRangePicker } from '@/components/admin/dashboard/DateRangePicker';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  const { recentOrders, revenueData, stats, isLoading } = useAdminDashboard(dateRange);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-end">
          <DateRangePicker onRangeChange={setDateRange} />
        </div>

        <DashboardStatsCards stats={stats} />

        <div className="grid gap-4 md:grid-cols-4">
          <RevenueChart data={revenueData} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
