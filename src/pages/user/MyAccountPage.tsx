
import { memo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserLayout from '@/components/layout/UserLayout';
import { useSafeAsync } from '@/utils/asyncUtils';
import { toast } from '@/hooks/use-toast';
import { withRenderCount } from '@/components/debug/withRenderCount';

// Memoized user info component with render tracking
const UserInfo = withRenderCount(
  memo(({ user, userBalance }: { user: any; userBalance: number }) => (
    <div>
      <h2>Thông tin tài khoản</h2>
      <p>ID người dùng: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Số dư: {userBalance}</p>
    </div>
  )),
  'UserInfo'
);

UserInfo.displayName = 'UserInfo';

const MyAccountPageBase = () => {
  const { user, userBalance, refreshUserBalance } = useAuth();

  const { execute: handleRefreshBalance, loading: isRefreshing } = useSafeAsync(async () => {
    try {
      await refreshUserBalance();
      toast.success('Cập nhật số dư thành công!');
    } catch (error) {
      toast.error('Không thể cập nhật số dư');
    }
  });

  const onRefreshClick = useCallback(() => {
    handleRefreshBalance();
  }, [handleRefreshBalance]);

  return (
    <UserLayout title="Tài khoản của tôi">
      <UserInfo user={user} userBalance={userBalance} />
      <button 
        onClick={onRefreshClick} 
        disabled={isRefreshing}
        className="mt-4 px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
      >
        {isRefreshing ? 'Đang làm mới...' : 'Làm mới số dư'}
      </button>
    </UserLayout>
  );
};

// Wrap the base component with render counting in development
export default process.env.NODE_ENV === 'development' 
  ? withRenderCount(MyAccountPageBase, 'MyAccountPage')
  : MyAccountPageBase;
