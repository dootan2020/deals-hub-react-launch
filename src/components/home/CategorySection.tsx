import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Brain, Code, Gamepad, ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Gmail',
    description: 'Tài khoản Gmail đã xác thực, đa dạng loại và mức giá',
    icon: Mail,
    color: 'bg-red-50 text-red-600',
    url: '/category/gmail'
  },
  {
    name: 'Facebook',
    description: 'Tài khoản Facebook cá nhân & BM với nhiều tùy chọn',
    icon: Facebook,
    color: 'bg-blue-50 text-blue-600',
    url: '/category/facebook'
  },
  {
    name: 'Tool AI',
    description: 'Công cụ AI giúp tăng hiệu suất công việc của bạn',
    icon: Brain,
    color: 'bg-purple-50 text-purple-600',
    url: '/category/tool-ai'
  },
  {
    name: 'Office',
    description: 'Microsoft Office, Google Workspace và các công cụ làm việc',
    icon: Code,
    color: 'bg-green-50 text-green-600',
    url: '/category/office'
  },
  {
    name: 'Game',
    description: 'Tài khoản game các loại, bảo hành đổi 1-1 nếu lỗi',
    icon: Gamepad,
    color: 'bg-yellow-50 text-yellow-600',
    url: '/category/game'
  }
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Danh mục nổi bật</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Khám phá các danh mục sản phẩm số đa dạng với chất lượng hàng đầu thị trường
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            
            return (
              <Link 
                to={category.url}
                key={index}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${category.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-text-light text-sm">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/products" className="inline-flex items-center font-medium text-primary hover:text-primary-dark">
            Xem tất cả danh mục
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
