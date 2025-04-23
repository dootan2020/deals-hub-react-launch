
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { ProductLogo } from './ProductLogo';
import { Button } from '@/components/ui/button';

export interface ProductCardProps {
  id: string;
  slug: string;
  platform: 'gmail' | 'facebook' | 'outlook' | 'default';
  title: string;
  stock: number;
  sold: number;
  price: number;
  description: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  id,
  slug,
  platform,
  title,
  stock,
  sold,
  price,
  description
}) => {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-card hover:shadow-card-hover transition-all">
      <div className="p-5">
        <div className="flex items-center mb-3">
          <ProductLogo type={platform} className="mr-3" />
          <h3 className="text-lg font-medium leading-tight line-clamp-1">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          {stock > 0 ? (
            <span className="badge-purple">
              Còn hàng: {stock}
            </span>
          ) : (
            <span className="badge bg-red-100 text-red-800">
              Hết hàng
            </span>
          )}
          
          {sold > 0 && (
            <span className="badge-green">
              Đã bán: {sold}
            </span>
          )}
        </div>
        
        <p className="text-text-light text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="mt-4 mb-3">
          <span className="text-xl font-bold text-primary">
            {formattedPrice}
          </span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Link to={`/product/${slug}`} className="flex-1">
            <Button variant="outline" className="w-full justify-center">
              Chi tiết
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          
          <Button className="flex-1 justify-center">
            Mua ngay
            <ShoppingCart className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
