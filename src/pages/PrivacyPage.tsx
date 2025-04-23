
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <Layout title="Chính sách bảo mật | AccZen.net">
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Chính sách bảo mật</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Bảo vệ thông tin của bạn</h2>
            </div>
            
            <div className="space-y-6 text-text-light">
              <p>
                AccZen.net cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi chỉ thu thập
                và sử dụng thông tin cần thiết cho việc xử lý đơn hàng và hỗ trợ khách hàng.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Thông tin chúng tôi thu thập</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Email (dùng để đăng nhập và liên hệ)</li>
                    <li>Lịch sử giao dịch và đơn hàng</li>
                    <li>Thông tin phiên đăng nhập</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Cam kết bảo mật</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Không lưu trữ thông tin thẻ tín dụng hoặc PayPal</li>
                    <li>Không chia sẻ thông tin cá nhân với bên thứ ba</li>
                    <li>Mã hóa dữ liệu người dùng</li>
                    <li>Tuân thủ các quy định về bảo vệ dữ liệu</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Quyền của người dùng</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Yêu cầu xóa tài khoản và dữ liệu</li>
                    <li>Truy cập và chỉnh sửa thông tin cá nhân</li>
                    <li>Từ chối nhận email marketing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
