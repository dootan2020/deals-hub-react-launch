
import { formatCurrency } from '@/lib/utils';

interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

const ProductPrice = ({ price, originalPrice, inStock }: ProductPriceProps) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <span className="font-semibold text-lg text-text">
          {formatCurrency(price)}
        </span>
        {originalPrice && (
          <span className="text-text-muted text-sm line-through ml-2">
            {formatCurrency(originalPrice)}
          </span>
        )}
      </div>
      
      {!inStock && (
        <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-text-light rounded-full">
          Out of Stock
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
