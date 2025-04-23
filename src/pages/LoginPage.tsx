
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for login logic
    console.log('Login form submitted');
  };
  
  return (
    <Layout title="Đăng nhập">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Đăng nhập</h1>
              <p className="text-text-light mt-2">Đăng nhập để truy cập tài khoản của bạn</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="email"
                    name="email" 
                    type="email" 
                    required 
                    placeholder="Nhập email của bạn" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Mật khẩu
                  </label>
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Nhập mật khẩu"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-text-light">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
