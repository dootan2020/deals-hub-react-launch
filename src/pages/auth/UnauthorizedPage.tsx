
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { ShieldAlert, Home, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UnauthorizedPage() {
  const { userRoles, isAuthenticated, refreshUserProfile, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshRoles = async () => {
    if (!isAuthenticated) return;
    
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      toast.success('Đã cập nhật thông tin quyền hạn');
      // Redirect to admin if roles now include admin
      if (userRoles.includes('admin')) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật thông tin quyền hạn');
    } finally {
      setIsRefreshing(false);
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
            <AlertDescription>
              <div className="text-sm text-left">
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Current roles: {userRoles.length > 0 ? userRoles.join(', ') : 'No roles assigned'}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          
          {isAuthenticated && (
            <Button variant="outline" onClick={handleRefreshRoles} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Permissions'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
