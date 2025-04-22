
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

export const useDataRefresh = (
  userId: string | undefined,
  fetchUserRoles: (userId: string) => Promise<string[]>,
  fetchUserBalance: (userId: string) => Promise<number>
) => {
  const dataRefreshInProgressRef = useRef<boolean>(false);

  const refreshUserData = useCallback(async () => {
    if (!userId || dataRefreshInProgressRef.current) return;
    
    console.debug('Refreshing user data');
    dataRefreshInProgressRef.current = true;
    
    try {
      const roles = await fetchUserRoles(userId);
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchUserBalance(userId);
      return roles;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật thông tin người dùng', {
        description: 'Vui lòng tải lại trang'
      });
      throw error;
    } finally {
      dataRefreshInProgressRef.current = false;
    }
  }, [userId, fetchUserRoles, fetchUserBalance]);

  return { refreshUserData };
};
