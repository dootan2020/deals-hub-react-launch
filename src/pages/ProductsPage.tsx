
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

// Mock data
const categories = [
  { id: '1', name: 'Gmail' },
  { id: '2', name: 'Facebook' },
  { id: '3', name: 'Tool AI' },
  { id: '4', name: 'Office' },
  { id: '5', name: 'Game' },
];

const mockProducts = [
  {
    id: '1',
    slug: 'gmail-new-phone-verified',
    platform: 'gmail',
    title: 'Gmail mới xác thực số điện thoại',
    stock: 245,
    sold: 1200,
    price: 55000,
    description: 'Gmail đã xác minh SĐT, đủ 30 ngày tuổi, có thể dùng cho mọi mục đích.'
  },
  {
    id: '2',
    slug: 'facebook-2fa',
    platform: 'facebook',
    title: 'Facebook BM có sẵn 2FA',
    stock: 18,
    sold: 357,
    price: 450000,
    description: 'Tài khoản Facebook Business Manager đã được bật bảo mật 2 lớp, an toàn.'
  },
  {
    id: '3',
    slug: 'chatgpt-plus-account',
    platform: 'default',
    title: 'Tài khoản ChatGPT Plus',
    stock: 57,
    sold: 423,
    price: 160000,
    description: 'Tài khoản ChatGPT Plus có sẵn gói đăng ký, truy cập GPT-4 và các tính năng cao cấp.'
  },
  {
    id: '4',
    slug: 'gmail-edu-unlimited',
    platform: 'gmail',
    title: 'Gmail Edu không giới hạn dung lượng',
    stock: 75,
    sold: 289,
    price: 120000,
    description: 'Gmail Education với dung lượng lưu trữ không giới hạn, phù hợp lưu trữ dữ liệu.'
  },
  {
    id: '5',
    slug: 'outlook-new-verified',
    platform: 'outlook',
    title: 'Outlook mới xác thực',
    stock: 156,
    sold: 532,
    price: 45000,
    description: 'Tài khoản Outlook mới, đã xác thực đầy đủ, an toàn cho mọi mục đích sử dụng.'
  },
  {
    id: '6',
    slug: 'facebook-old-account',
    platform: 'facebook',
    title: 'Tài khoản Facebook 5 năm tuổi',
    stock: 23,
    sold: 187,
    price: 350000,
    description: 'Facebook với độ tuổi cao, đã trải qua nhiều đợt kiểm duyệt, độ an toàn cao.'
  },
  {
    id: '7',
    slug: 'tool-ai-writer',
    platform: 'default',
    title: 'Tool AI Writer Premium',
    stock: 34,
    sold: 120,
    price: 230000,
    description: 'Công cụ viết nội dung bằng AI, đã có sẵn bản quyền 1 năm, hỗ trợ tiếng Việt.'
  },
  {
    id: '8',
    slug: 'gmail-old-phone-verified',
    platform: 'gmail',
    title: 'Gmail cổ đã xác thực SĐT',
    stock: 0,
    sold: 1450,
    price: 180000,
    description: 'Gmail 5 năm tuổi, đã xác minh SĐT, độ tin cậy cao, không giới hạn gửi mail.'
  },
] as {
  id: string;
  slug: string;
  platform: 'gmail' | 'facebook' | 'outlook' | 'default';
  title: string;
  stock: number;
  sold: number;
  price: number;
  description: string;
}[];

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const ProductsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Filter and sort products
  const filteredProducts = mockProducts
    .filter(product => {
      // Filter by category
      if (selectedCategory && product.platform !== selectedCategory) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort products
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      
      // Default sort by newest (using ID as proxy for creation date)
      return parseInt(b.id) - parseInt(a.id);
    });
  
  return (
    <Layout title="Danh sách sản phẩm">
      <div className="bg-background-secondary py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Danh sách sản phẩm</h1>
          
          {/* Search and Filters */}
          <div className="bg-white p-5 rounded-lg shadow-sm mb-8">
            {/* Search bar */}
            <div className="flex gap-4 mb-5">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-56">
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={18} className="text-gray-500 mr-1" />
              <span className="text-sm font-medium mr-2">Danh mục:</span>
              
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                Tất cả
              </Button>
              
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id === '1' ? 'gmail' : category.id === '2' ? 'facebook' : 'default')}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
