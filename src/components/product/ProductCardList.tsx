import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ProductQuickView from './ProductQuickView';
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
      {/* Product Image with hover effect */}
      <div className="relative h-[180px] w-[180px] min-w-[180px] bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badges && product.badges.length > 0 && (
            product.badges.map((badge, index) => {
              let badgeClass = "";
              
              if (badge.includes("OFF")) {
                badgeClass = "bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              } else if (badge === "Featured") {
                badgeClass = "bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              } else if (badge === "Hot") {
                badgeClass = "bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              } else if (badge === "Best Seller") {
                badgeClass = "bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              } else if (badge === "Limited") {
                badgeClass = "bg-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              } else {
                badgeClass = "bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
              }
              
              return (
                <span key={index} className={badgeClass}>
                  {badge}
                </span>
              );
            })
          )}
        </div>
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <Link to={`/product/${product.slug}`} className="group">
              <h3 className="font-medium text-lg mb-1 transition-colors duration-200 group-hover:text-primary">
                {product.title}
              </h3>
            </Link>
            
            <div className="flex items-center mb-2">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-text-light">
                ({product.reviewCount})
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {product.features && product.features.length > 0 && (
              <ul className="text-sm text-gray-600 mb-3 space-y-1 hidden md:block">
                {product.features.slice(0, 2).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-1 w-1 bg-gray-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="min-w-[120px] text-right">
            {!product.inStock && (
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                Out of Stock
              </span>
            )}
            
            <div className="mt-2">
              <span className="font-semibold text-lg text-text">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="block text-gray-400 text-sm line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center pt-3">
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" /> Quick View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <ProductQuickView product={product} />
              </DialogContent>
            </Dialog>
          </div>
          
          <BuyNowButton
            kioskToken={product.kiosk_token || ''}
            quantity={1}
            isInStock={product.inStock}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCardList;
