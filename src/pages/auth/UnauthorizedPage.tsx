
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { ShieldAlert, Home, RefreshCw, LogOut, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export default function UnauthorizedPage() {
  const { userRoles, isAuthenticated, refreshUserProfile, user, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingDirectly, setIsCheckingDirectly] = useState(false);
  const [directCheckResult, setDirectCheckResult] = useState<string | null>(null);
  
  const handleRefreshSession = async () => {
    try {
      setIsRefreshing(true);
      toast.info("Đang làm mới phiên đăng nhập...");
      
      // First, refresh the auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        toast.error("Không thể làm mới phiên đăng nhập", {
          description: sessionError.message
        });
        return;
      }
      
      toast.success("Đã làm mới phiên đăng nhập thành công");
      
      // Then refresh the user profile
      await refreshUserProfile();
      toast.success('Đã cập nhật thông tin quyền hạn');
      
      // Redirect to admin if roles now include admin
      if (userRoles.includes(UserRole.Admin)) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Không thể cập nhật phiên đăng nhập');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshRoles = async () => {
    if (!isAuthenticated) return;
    
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast.success('Đã cập nhật thông tin quyền hạn');
      // Redirect to admin if roles now include admin
      if (userRoles.includes(UserRole.Admin)) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật thông tin quyền hạn');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDirectRoleCheck = async () => {
    if (!user?.id) return;
    
    try {
      setIsCheckingDirectly(true);
      setDirectCheckResult(null);
      
      // Make a direct call to the function to verify roles
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: user.id
      });
      
      if (error) {
        setDirectCheckResult(`Lỗi kiểm tra: ${error.message}`);
        return;
      }
      
      setDirectCheckResult(`Kết quả kiểm tra trực tiếp: ${JSON.stringify(data)}`);
      
      // If admin role exists but not in current state, force refresh
      if (data && Array.isArray(data) && data.includes('Admin') && !userRoles.includes(UserRole.Admin)) {
        toast.warning('Phát hiện quyền admin từ Supabase nhưng chưa được cập nhật trên UI');
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error directly checking roles:', error);
      setDirectCheckResult(`Lỗi: ${error}`);
    } finally {
      setIsCheckingDirectly(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout?.();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Không thể đăng xuất. Thử tải lại trang');
    }
  };

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-6" />
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-4">
          You don't have permission to access this page.
        </p>
        
        {isAuthenticated && (
          <Alert className="mb-6 max-w-lg">
            <AlertTitle>Thông tin tài khoản</AlertTitle>
            <AlertDescription>
              <div className="text-sm text-left">
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Current roles: {userRoles.length > 0 ? userRoles.join(', ') : 'No roles assigned'}</p>
                {directCheckResult && (
                  <p className="text-amber-600 font-mono text-xs mt-2 p-1 bg-amber-50 rounded">
                    {directCheckResult}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          {isAuthenticated && (
            <>
              <Button variant="outline" onClick={handleRefreshSession} disabled={isRefreshing}>
                <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
              </Button>
              
              <Button variant="outline" onClick={handleRefreshRoles} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Permissions'}
              </Button>
              
              <Button variant="outline" onClick={handleDirectRoleCheck} disabled={isCheckingDirectly}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isCheckingDirectly ? 'animate-spin' : ''}`} />
                {isCheckingDirectly ? 'Checking...' : 'Check Roles Directly'}
              </Button>
              
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
