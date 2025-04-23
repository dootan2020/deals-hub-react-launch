
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { ProductLogo } from '@/components/product/ProductLogo';
import { ProductBadge } from '@/components/product/ProductBadge';
import ProductPurchaseSection from '@/components/product/ProductPurchaseSection';

// Mock data for demonstration
const mockProducts = [
  {
    id: '1',
    slug: 'gmail-new-phone-verified',
    platform: 'gmail',
    title: 'Gmail mới xác thực số điện thoại',
    stock: 245,
    sold: 1200,
    price: 55000,
    description: 'Gmail đã xác minh SĐT, đủ 30 ngày tuổi, có thể dùng cho mọi mục đích.',
    longDescription: `
      <h3>Thông tin chi tiết</h3>
      <p>Gmail đã được xác thực với số điện thoại thực, đảm bảo độ an toàn và tin cậy cao.</p>
      
      <h3>Đặc điểm nổi bật</h3>
      <ul>
        <li>Đã xác thực số điện thoại</li>
        <li>Độ tuổi tài khoản trên 30 ngày</li>
        <li>Có thể thay đổi mật khẩu, email khôi phục</li>
        <li>Đã kích hoạt đầy đủ tính năng của Google</li>
        <li>Không bị giới hạn gửi email</li>
      </ul>
      
      <h3>Hướng dẫn sử dụng</h3>
      <p>Sau khi mua hàng, bạn sẽ nhận được thông tin đăng nhập qua email. Vui lòng thay đổi mật khẩu và thêm phương thức khôi phục của riêng bạn càng sớm càng tốt.</p>
      
      <h3>Chính sách bảo hành</h3>
      <p>Bảo hành 24h đổi 1:1 nếu tài khoản không đúng mô tả hoặc không thể truy cập.</p>
    `
  },
  {
    id: '2',
    slug: 'facebook-2fa',
    platform: 'facebook',
    title: 'Facebook BM có sẵn 2FA',
    stock: 18,
    sold: 357,
    price: 450000,
    description: 'Tài khoản Facebook Business Manager đã được bật bảo mật 2 lớp, an toàn.',
    longDescription: `
      <h3>Thông tin chi tiết</h3>
      <p>Tài khoản Facebook Business Manager với bảo mật 2 lớp đã được thiết lập, đảm bảo an toàn tối đa cho hoạt động quảng cáo của bạn.</p>
      
      <h3>Đặc điểm nổi bật</h3>
      <ul>
        <li>Đã kích hoạt bảo mật 2 lớp (2FA)</li>
        <li>Độ tuổi tài khoản 6+ tháng</li>
        <li>Limit chi tiêu cao</li>
        <li>Đã xác minh danh tính</li>
        <li>Đủ điều kiện tạo nhiều tài khoản quảng cáo</li>
      </ul>
      
      <h3>Lưu ý quan trọng</h3>
      <p>Sau khi mua hàng, bạn sẽ nhận được toàn bộ thông tin đăng nhập bao gồm mã 2FA và hướng dẫn chi tiết cách truy cập.</p>
    `
  }
] as {
  id: string;
  slug: string;
  platform: 'gmail' | 'facebook' | 'outlook' | 'default';
  title: string;
  stock: number;
  sold: number;
  price: number;
  description: string;
  longDescription: string;
}[];

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Find product by slug
  const product = mockProducts.find(p => p.slug === slug);
  
  if (!product) {
    return (
      <Layout title="Sản phẩm không tồn tại">
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
          <p className="mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button asChild>
            <a href="/products">Quay lại danh sách sản phẩm</a>
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={product.title}>
      <div className="bg-background-secondary py-8">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            {/* Product header */}
            <div className="flex items-center gap-3 mb-6">
              <ProductBadge type={product.platform} />
              <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left column - Product info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {product.stock > 0 ? (
                    <span className="badge-purple">
                      Còn hàng: {product.stock}
                    </span>
                  ) : (
                    <span className="badge bg-red-100 text-red-800">
                      Hết hàng
                    </span>
                  )}
                  
                  {product.sold > 0 && (
                    <span className="badge-green">
                      Đã bán: {product.sold}
                    </span>
                  )}
                </div>
                
                <div className="text-3xl font-bold text-primary mb-6">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </div>
                
                <div className="mb-6">
                  <p className="text-text-light">{product.description}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Bảo hành 24h đổi 1-1 nếu lỗi</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Giao hàng tự động sau khi thanh toán</span>
                  </div>
                </div>
              </div>
              
              {/* Right column - Purchase section */}
              <ProductPurchaseSection product={product} />
            </div>
          </div>
          
          {/* Product description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Chi tiết sản phẩm</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.longDescription }} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
