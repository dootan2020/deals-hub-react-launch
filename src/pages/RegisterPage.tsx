
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for registration logic
    console.log('Registration form submitted');
  };
  
  return (
    <Layout title="Đăng ký">
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Tạo tài khoản mới</h1>
              <p className="text-text-light mt-2">Đăng ký để trải nghiệm dịch vụ của chúng tôi</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    id="name"
                    name="name" 
                    type="text" 
                    required 
                    placeholder="Nhập họ và tên của bạn" 
                    className="pl-10"
                  />
                </div>
              </div>
              
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
                <label htmlFor="password" className="block text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Tạo mật khẩu mới"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="block text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-light">
                  Tôi đồng ý với <a href="#" className="text-primary">Điều khoản sử dụng</a> và <a href="#" className="text-primary">Chính sách bảo mật</a>
                </label>
              </div>
              
              <Button type="submit" className="w-full">
                Đăng ký
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-text-light">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                    Đăng nhập
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

export default RegisterPage;
