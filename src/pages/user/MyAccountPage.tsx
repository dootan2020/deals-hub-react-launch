import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { useSafeAsync } from '@/utils/asyncUtils';
import { toast } from '@/hooks/use-toast';

const MyAccountPage = () => {
  const { user, userBalance, refreshUserBalance, userRoles } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { execute: handleRefreshBalance } = useSafeAsync(async () => {
    setIsRefreshing(true);
    try {
      await refreshUserBalance();
      toast.success('Cập nhật số dư thành công!');
    } finally {
      setIsRefreshing(false);
    }
  });

  return (
    <UserLayout title="Tài khoản của tôi">
      <div>
        <h2>Thông tin tài khoản</h2>
        <p>ID người dùng: {user?.id}</p>
        <p>Email: {user?.email}</p>
        <p>Số dư: {userBalance}</p>
        <button onClick={handleRefreshBalance} disabled={isRefreshing}>
          {isRefreshing ? 'Đang làm mới...' : 'Làm mới số dư'}
        </button>
      </div>
    </UserLayout>
  );
};

export default MyAccountPage;
