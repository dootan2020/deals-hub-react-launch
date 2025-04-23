
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield } from 'lucide-react';

const TermsPage = () => {
  return (
    <Layout title="Điều khoản sử dụng | AccZen.net">
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Điều khoản sử dụng</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Quy định và điều khoản</h2>
            </div>
            
            <div className="space-y-6 text-text-light">
              <p>
                Bằng việc sử dụng dịch vụ của AccZen.net, bạn đồng ý với các điều khoản sau đây.
                Vui lòng đọc kỹ trước khi thực hiện giao dịch.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Sản phẩm và dịch vụ</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Tất cả sản phẩm là hàng hóa số, được giao ngay sau thanh toán</li>
                    <li>Không hoàn tiền với các sản phẩm đã giao, trừ lỗi hệ thống</li>
                    <li>Bảo hành 1-1 trong vòng 24h nếu sản phẩm lỗi</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Trách nhiệm người dùng</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Tự chịu trách nhiệm về việc mua bán lại sản phẩm</li>
                    <li>Không sử dụng sản phẩm vào mục đích bất hợp pháp</li>
                    <li>Bảo mật thông tin tài khoản cá nhân</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3">Thanh toán và giao dịch</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Giá sản phẩm có thể thay đổi mà không báo trước</li>
                    <li>Đơn hàng chỉ được xử lý sau khi thanh toán thành công</li>
                    <li>Số dư tài khoản không được rút về tiền mặt</li>
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

export default TermsPage;
