
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
        {/* Product Image with hover effect - increased size by ~15-20% */}
        <div className="relative h-60 bg-[#F3F4F6] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Quick action buttons on hover */}
          <div className={`absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Link to={`/product/${product.slug}`}>
              <Button size="sm" variant="secondary" className="rounded-full p-2 bg-white text-text hover:bg-[#F3F4F6]">
                <Eye className="h-4 w-4" />
                <span className="sr-only">Quick view</span>
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full p-2 bg-white text-text hover:bg-[#F3F4F6]"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges && product.badges.length > 0 && (
              product.badges.map((badge, index) => {
                let badgeClass = "";
                
                if (badge.includes("OFF")) {
                  badgeClass = "badge-discount";
                } else if (badge === "Featured") {
                  badgeClass = "badge-featured";
                } else if (badge === "Hot") {
                  badgeClass = "badge-hot";
                } else if (badge === "Best Seller") {
                  badgeClass = "badge-bestseller";
                } else if (badge === "Limited") {
                  badgeClass = "bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
                } else {
                  badgeClass = "bg-gray-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm";
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
              <span className="badge-discount">
                {discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/product/${product.slug}`} className="group">
            <h3 className="font-medium text-lg mb-1 transition-colors duration-200 group-hover:text-primary truncate text-text">
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
                      ? "text-[#F59E0B] fill-[#F59E0B]" 
                      : "text-gray-400"
                  }`} 
                />
              ))}
            </div>
            <span className="text-xs text-text-light">
              ({product.reviewCount})
            </span>
          </div>
          
          <p className="text-sm text-text-light mb-3 line-clamp-2 flex-grow">
            {product.description}
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-lg text-text">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-text-muted text-sm line-through ml-2">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              
              {!product.inStock && (
                <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-text-light rounded-full">
                  Out of Stock
                </span>
              )}
            </div>
            
            <Button 
              className="w-full hover:bg-primary-dark transition-colors"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
