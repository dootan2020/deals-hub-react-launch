
import React, { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { usePurchase } from '@/hooks/use-purchase';
import { ShoppingCart, Zap, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProductPurchaseSectionProps {
  product: Product;
}

const ProductPurchaseSection: React.FC<ProductPurchaseSectionProps> = ({ product }) => {
  const { purchaseProduct, isLoading, purchaseKey } = usePurchase();
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePurchase = async () => {
    if (!product.id) return;
    const result = await purchaseProduct(product.id);
    if (result.success && result.key) {
      setShowKeyDialog(true);
    }
  };

  const copyKeyToClipboard = () => {
    if (purchaseKey) {
      navigator.clipboard.writeText(purchaseKey);
      setCopied(true);
      toast.success('Đã sao chép mã kích hoạt');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
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
            <span className="text-sm text-gray-600">Tình trạng:</span>
            <span className={`text-sm font-medium ${product.stock && product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock && product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
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
            {isLoading ? 'Đang xử lý...' : 'Mua ngay'}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // Add to cart functionality (to be implemented)
              toast.info('Thông báo', { description: 'Chức năng thêm vào giỏ hàng sẽ được cập nhật sau' });
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Thêm vào giỏ hàng
          </Button>
        </div>
      </div>

      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mua hàng thành công!</DialogTitle>
            <DialogDescription>
              Sản phẩm của bạn đã được kích hoạt. Dưới đây là mã kích hoạt của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="bg-gray-100 p-4 rounded-md font-mono text-center text-lg">
                {purchaseKey}
              </div>
            </div>
            <Button type="button" size="icon" onClick={copyKeyToClipboard}>
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Lưu ý: Vui lòng lưu lại mã kích hoạt này. Bạn cũng có thể xem lại trong lịch sử đơn hàng.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductPurchaseSection;
