
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { calculateDiscountPercentage } from '@/lib/utils';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import ProductImage from './card/ProductImage';
import ProductBadges from './card/ProductBadges';
import ProductRating from './card/ProductRating';
import ProductPrice from './card/ProductPrice';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  return (
    <div 
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col card-hover">
        <div className="relative">
          <ProductImage product={product} isHovered={isHovered} />
          <ProductBadges badges={product.badges} discountPercentage={discountPercentage} />
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.slug}`} className="group">
            <h3 className="font-medium text-lg mb-1 transition-colors duration-200 group-hover:text-primary truncate text-text">
              {product.title}
            </h3>
          </Link>
          
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
          
          <p className="text-sm text-text-light mb-3 line-clamp-2 flex-grow">
            {product.description}
          </p>
          
          <div className="mt-auto">
            <ProductPrice 
              price={product.price}
              originalPrice={product.originalPrice}
              inStock={product.inStock}
            />
            
            <BuyNowButton
              kioskToken={product.kiosk_token || ''}
              quantity={1}
              isInStock={product.inStock}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
