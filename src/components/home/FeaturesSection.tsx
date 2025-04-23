
import React from 'react';
import { Check, Package, Zap } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Mua hàng nhanh chóng',
    description: 'Thanh toán dễ dàng và nhận sản phẩm ngay lập tức qua email',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Package,
    title: 'Giao hàng tự động',
    description: 'Hệ thống tự động giao hàng ngay sau khi thanh toán thành công',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Check,
    title: 'Bảo hành sản phẩm',
    description: 'Đảm bảo 1-1 trong 24h nếu sản phẩm có vấn đề',
    color: 'bg-purple-50 text-purple-600'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-background-secondary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            AccZen.net cung cấp trải nghiệm mua sắm sản phẩm số tốt nhất với nhiều ưu điểm vượt trội
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${feature.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-text-light">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
