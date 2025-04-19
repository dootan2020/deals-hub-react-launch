import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { useOrderStats } from '@/hooks/useOrderStats';
import { toast } from 'sonner';
import { processSpecificTransaction, checkDepositStatus } from '@/utils/payment';
import BalanceCard from '@/components/dashboard/BalanceCard';
import OrderStatsCard from '@/components/dashboard/OrderStatsCard';
import CompletedOrdersCard from '@/components/dashboard/CompletedOrdersCard';
import DepositHistoryCard from '@/components/dashboard/DepositHistoryCard';

const DashboardPage = () => {
  const { user, userBalance, refreshUserBalance, userRoles } = useAuth();
  const { stats, isLoading } = useOrderStats(user?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserBalance();
      toast.success('Cập nhật số dư thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật số dư.');
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleProcessTransaction = async (transactionId: string) => {
    try {
      setIsRefreshing(true);
      toast.info(`Đang xử lý giao dịch ${transactionId}...`);
      
      const result = await processSpecificTransaction(transactionId);
      
      if (result.success) {
        toast.success('Xử lý giao dịch thành công!');
        await refreshUserBalance();
      } else {
        toast.error(`Lỗi: ${result.error || 'Không thể xử lý giao dịch'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckOrder = async (orderId: string) => {
    try {
      setIsRefreshing(true);
      toast.info(`Đang kiểm tra trạng thái đơn hàng ${orderId}...`);
      
      const result = await checkDepositStatus(orderId);
      
      if (result.success) {
        if (result.deposit) {
          toast.success(`Đơn nạp tiền có trạng thái: ${result.deposit.status}`);
          
          if (result.deposit.status === 'completed') {
            toast.info('Giao dịch đã hoàn thành. Đang cập nhật số dư...');
            await refreshUserBalance();
          } else if (result.deposit.status === 'pending') {
            toast.info('Giao dịch đang xử lý. Vui lòng thử lại sau.');
          }
        } else {
          toast.info('Đã kích hoạt xử lý giao dịch.');
          await refreshUserBalance();
        }
      } else {
        toast.error(`Lỗi khi kiểm tra: ${result.error || 'Không tìm thấy đơn hàng'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <UserLayout title="Bảng điều khiển">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard 
          userBalance={userBalance}
          isRefreshing={isRefreshing}
          onRefreshBalance={handleRefreshBalance}
        />

        <OrderStatsCard 
          processing={isLoading ? 0 : stats.processing}
          total={isLoading ? 0 : stats.total}
        />

        <CompletedOrdersCard 
          completed={isLoading ? 0 : stats.completed}
        />

        <DepositHistoryCard 
          isAdmin={userRoles.includes('admin')}
          isStaff={userRoles.includes('staff')}
          isRefreshing={isRefreshing}
          onProcessTransaction={handleProcessTransaction}
          onCheckOrder={handleCheckOrder}
        />
      </div>
    </UserLayout>
  );
};

export default DashboardPage;
