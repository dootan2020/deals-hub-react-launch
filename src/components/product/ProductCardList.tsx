
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { calculateDiscountPercentage } from '@/lib/utils';
import ProductBadges from './card/ProductBadges';
import ProductRating from './card/ProductRating';
import ProductPrice from './card/ProductPrice';
import ProductFeatures from './card/ProductFeatures';
import ProductQuickViewDialog from './card/ProductQuickViewDialog';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';

interface ProductCardListProps {
  product: Product;
}

const ProductCardList = ({ product }: ProductCardListProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  return (
    <div 
      className="group relative w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[180px] w-[180px] min-w-[180px] bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <ProductBadges badges={product.badges} discountPercentage={discountPercentage} />
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <Link to={`/product/${product.slug}`} className="group">
              <h3 className="font-medium text-lg mb-1 transition-colors duration-200 group-hover:text-primary">
                {product.title}
              </h3>
            </Link>
            
            <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
            
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <ProductFeatures features={product.features} />
          </div>
          
          <div className="min-w-[120px] text-right">
            <ProductPrice 
              price={product.price}
              originalPrice={product.originalPrice}
              inStock={product.inStock}
            />
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center pt-3">
          <div className="flex space-x-2">
            <ProductQuickViewDialog product={product} />
          </div>
          
          <div>
            <BuyNowButton
              kioskToken={product.kiosk_token}
              productId={product.id}
              quantity={1}
              isInStock={product.inStock}
              className="bg-primary hover:bg-primary-dark"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardList;
