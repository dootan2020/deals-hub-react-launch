
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { usePurchase } from '@/hooks/use-purchase';
import { ShoppingCart, Zap } from 'lucide-react';

interface ProductPurchaseSectionProps {
  product: Product;
}

const ProductPurchaseSection: React.FC<ProductPurchaseSectionProps> = ({ product }) => {
  const { purchaseProduct, isLoading } = usePurchase();

  const handlePurchase = async () => {
    if (!product.id) return;
    await purchaseProduct(product.id);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.price)}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Availability:</span>
          <span className={`text-sm font-medium ${product.stock && product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock && product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          className="w-full" 
          disabled={!product.stock || product.stock <= 0 || isLoading}
          onClick={handlePurchase}
        >
          <Zap className="mr-2 h-4 w-4" />
          {isLoading ? 'Processing...' : 'Mua ngay'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Add to cart functionality (to be implemented)
            alert('Chức năng thêm vào giỏ hàng sẽ được cập nhật sau');
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Thêm vào giỏ hàng
        </Button>
      </div>
    </div>
  );
};

export default ProductPurchaseSection;
