
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { ProductLogo } from './ProductLogo';
import { Button } from '@/components/ui/button';
import { usePurchase } from '@/hooks/use-purchase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

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

  const { isAuthenticated, user } = useAuth();
  const { purchaseProduct, isLoading, purchaseKey } = usePurchase();
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để mua sản phẩm.');
      return;
    }
    toast.info('Đang xử lý giao dịch...');
    const result = await purchaseProduct(id, 1);
    if (result.success && result.key) {
      setShowKey(result.key);
      toast.success('Mua hàng thành công', `Key: ${result.key}`);
    } else if (result.error) {
      toast.error('Mua hàng thất bại', result.error);
    }
  };

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
          
          <Button 
            className="flex-1 justify-center"
            onClick={handleBuyNow}
            disabled={isLoading || stock <= 0}
          >
            {isLoading ? (
              <>
                Đang mua...
                <ShoppingCart className="w-4 h-4 ml-1 animate-spin" />
              </>
            ) : (
              <>
                Mua ngay
                <ShoppingCart className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {showKey && (
          <div className="mt-3 px-3 py-2 bg-green-100 rounded text-green-700 text-sm break-all select-all">
            Key sản phẩm: <b>{showKey}</b>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

