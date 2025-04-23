
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <Layout title="404 - Không tìm thấy trang">
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-3xl font-bold mt-4">Không tìm thấy trang</h2>
          <p className="mt-2 text-text-light">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>
                Quay về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
