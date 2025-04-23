
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout title="Giới thiệu | AccZen.net">
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Về AccZen.net</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-semibold">Nền tảng mua sắm số tự động hàng đầu</h2>
              </div>
              
              <div className="space-y-4 text-text-light">
                <p>
                  AccZen.net là nền tảng chuyên cung cấp các sản phẩm số như key phần mềm, tài khoản
                  premium và công cụ trực tuyến cho thị trường MMO Việt Nam.
                </p>
                
                <div className="grid gap-6 md:grid-cols-2 mt-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">Giao dịch tự động 24/7</h3>
                    <p>Nhận key và tài khoản ngay lập tức sau khi thanh toán thành công</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">Bảo hành 1-1</h3>
                    <p>Cam kết đổi mới trong vòng 24h nếu sản phẩm không hoạt động đúng mô tả</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">Thanh toán an toàn</h3>
                    <p>Hỗ trợ nạp tiền qua PayPal - Cổng thanh toán quốc tế uy tín</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3">Hỗ trợ khách hàng</h3>
                    <p>Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
