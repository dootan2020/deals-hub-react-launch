
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discountPercentage = product.originalPrice 
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md group-hover:-translate-y-1">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-contain p-4"
          />
          
          {/* Badges */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.badges.map((badge, index) => {
                let badgeClass = "text-xs font-medium px-2 py-1 rounded";
                
                if (badge.includes("OFF")) {
                  badgeClass += " bg-red-500 text-white";
                } else if (badge === "Featured") {
                  badgeClass += " bg-primary text-white";
                } else if (badge === "Hot") {
                  badgeClass += " bg-orange-500 text-white";
                } else if (badge === "Best Seller") {
                  badgeClass += " bg-accent text-white";
                } else if (badge === "Limited") {
                  badgeClass += " bg-purple-500 text-white";
                } else {
                  badgeClass += " bg-gray-200 text-gray-800";
                }
                
                return (
                  <span key={index} className={badgeClass}>
                    {badge}
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                {discountPercentage}% OFF
              </span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
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
          
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-text">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-text-light text-sm line-through ml-2">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            
            {!product.inStock && (
              <span className="text-xs text-red-500 font-medium">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
