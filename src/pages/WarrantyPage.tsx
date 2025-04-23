
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

const WarrantyPage = () => {
  return (
    <Layout title="Chính sách bảo hành | AccZen.net">
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Chính sách bảo hành</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Cam kết chất lượng sản phẩm</h2>
            </div>
            
            <div className="space-y-6 text-text-light">
              <p>
                Tại AccZen.net, chúng tôi cam kết cung cấp các sản phẩm số chất lượng cao và 
                hoạt động đúng như mô tả. Để đảm bảo quyền lợi của khách hàng, chúng tôi áp dụng 
                chính sách bảo hành sau:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Thời gian bảo hành</h3>
                  <p>Tất cả sản phẩm được bảo hành trong vòng 24h kể từ thời điểm mua hàng</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Điều kiện bảo hành</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Sản phẩm không hoạt động đúng như mô tả</li>
                    <li>Key/tài khoản bị khóa hoặc vô hiệu hóa</li>
                    <li>Lỗi kỹ thuật từ phía hệ thống</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Quy trình bảo hành</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Liên hệ support qua email hoặc live chat</li>
                    <li>Cung cấp mã đơn hàng và mô tả lỗi</li>
                    <li>Nhận key/tài khoản thay thế trong vòng 24h</li>
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

export default WarrantyPage;
