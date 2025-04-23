
import React from 'react';
import { Link } from 'react-router-dom';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const UnauthorizedPage: React.FC = () => {
  const { isAuthenticated, userRoles } = useAuth();

  return (
    <Layout title="403 - Không có quyền truy cập">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Không có quyền truy cập</h2>
            <p className="mt-2 text-gray-600">
              Bạn không có quyền truy cập vào trang này.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-yellow-700">
                  {isAuthenticated
                    ? 'Tài khoản của bạn không có quyền truy cập trang này.'
                    : 'Vui lòng đăng nhập để truy cập trang này.'}
                </p>
                {isAuthenticated && userRoles.length > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Vai trò hiện tại: {userRoles.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Button asChild className="w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Về trang chủ
              </Link>
            </Button>

            {!isAuthenticated && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Đăng nhập</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UnauthorizedPage;
