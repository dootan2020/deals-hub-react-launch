
import React from 'react';
import { Product } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { QuantitySelector } from './QuantitySelector';
import { ProductInfo } from './ProductInfo';
import { PromotionCodeInput } from './PromotionCodeInput';
import { BalanceInfo } from './BalanceInfo';

interface DialogContentProps {
  product: Product;
  isVerifying: boolean;
  quantity: number;
  verifiedStock: number | null;
  verifiedPrice: number | null;
  priceUSD: number;
  totalPriceUSD: number;
  promotionCode: string;
  onQuantityChange: (quantity: number) => void;
  onPromotionCodeChange: (code: string) => void;
  isLoadingBalance: boolean;
  userBalance: number | null;
}

export const DialogContent = ({
  product,
  isVerifying,
  quantity,
  verifiedStock,
  verifiedPrice,
  priceUSD,
  totalPriceUSD,
  promotionCode,
  onQuantityChange,
  onPromotionCodeChange,
  isLoadingBalance,
  userBalance,
}: DialogContentProps) => {
  const hasEnoughBalance = userBalance !== null && userBalance >= totalPriceUSD;

  return (
    <div className="space-y-4 py-4">
      <ProductInfo 
        product={product} 
        verifiedPrice={verifiedPrice} 
        priceUSD={priceUSD} 
      />

      {isVerifying ? (
        <div className="flex flex-col items-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Đang kiểm tra tồn kho và cập nhật giá...
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-2 py-4">
            <QuantitySelector
              quantity={quantity}
              maxQuantity={verifiedStock ?? product.stockQuantity ?? 1}
              onQuantityChange={onQuantityChange}
              verifiedStock={verifiedStock}
              productStock={product.stockQuantity ?? 0}
            />
          </div>
          
          <PromotionCodeInput 
            promotionCode={promotionCode}
            onChange={onPromotionCodeChange}
          />
          
          <BalanceInfo
            isLoadingBalance={isLoadingBalance}
            userBalance={userBalance}
            totalPriceUSD={totalPriceUSD}
          />
          
          {!isLoadingBalance && !hasEnoughBalance && (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Số dư tài khoản của bạn không đủ để thực hiện giao dịch này.
              </AlertDescription>
            </Alert>
          )}
          
          {!isVerifying && verifiedStock !== null && verifiedStock < (product.stockQuantity || 0) && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800">
                Tồn kho thực tế ({verifiedStock}) thấp hơn dự kiến.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};
