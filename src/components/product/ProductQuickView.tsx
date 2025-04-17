
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductQuickViewProps {
  product: Product;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  
  // Get short description from full description if needed
  const getShortDescription = (description: string): string => {
    if (!description) return '';
    const maxLength = 200;
    if (description.length <= maxLength) return description;
    
    // Try to find a natural break point
    const breakPoints = ['. ', '? ', '! '];
    for (const point of breakPoints) {
      const endPos = description.substring(0, maxLength).lastIndexOf(point);
      if (endPos > 0) {
        return description.substring(0, endPos + 1);
      }
    }
    
    // If no good break point, just cut and add ellipsis
    return description.substring(0, maxLength) + '...';
  };
  
  const handleAddToCart = () => {
    if (product.inStock) {
      // Here would be the actual cart logic
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.title} has been added to your cart.`,
        variant: "default",
      });
    }
  };
  
  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.title} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
      variant: "default",
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Product Images */}
      <div className="md:w-1/2">
        <div className="bg-[#F3F4F6] rounded-lg p-4 mb-4">
          <img 
            src={product.images[selectedImage]} 
            alt={product.title} 
            className="w-full h-[300px] object-contain"
          />
        </div>
        
        {product.images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {product.images.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`border rounded-md p-2 ${selectedImage === index ? 'border-[#1A936F]' : 'border-[#E5E7EB]'}`}
              >
                <img src={image} alt={`${product.title} thumbnail ${index + 1}`} className="w-full h-12 object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="md:w-1/2">
        <h2 className="text-2xl font-semibold mb-2 text-[#1E1E1E]">{product.title}</h2>
        
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) 
                    ? "text-[#F59E0B] fill-[#F59E0B]" 
                    : "text-[#E5E7EB]"
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-[#6B7280]">
            ({product.reviewCount} reviews)
          </span>
        </div>
        
        <div className="mb-4">
          <span className="text-2xl font-bold text-[#1A936F] mr-2">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[#6B7280] text-lg line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          {product.originalPrice && (
            <span className="ml-2 inline-block bg-[#FFECEC] text-[#D7263D] text-sm px-2 py-0.5 rounded-md">
              {calculateDiscountPercentage(product.originalPrice, product.price)}% OFF
            </span>
          )}
        </div>
        
        <p className="text-[#4B5563] mb-4">
          {product.shortDescription || getShortDescription(product.description)}
        </p>
        
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2 text-[#1E1E1E]">Key Features:</h3>
            <ul className="space-y-1 text-[#4B5563]">
              {product.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1A936F] mt-1.5 mr-2"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center mb-6">
          <span className="text-sm font-medium mr-4 text-[#1E1E1E]">Quantity:</span>
          <div className="flex items-center border rounded-md border-[#E5E7EB]">
            <button 
              className="px-3 py-1 border-r border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-1 text-[#1E1E1E]">{quantity}</span>
            <button 
              className="px-3 py-1 border-l border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
            >
              +
            </button>
          </div>
          
          {product.stockQuantity !== undefined ? (
            product.stockQuantity > 0 ? (
              <span className="ml-4 text-sm text-[#1A936F]">
                In Stock: {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
              </span>
            ) : (
              <span className="ml-4 text-sm text-[#D7263D]">
                Out of Stock
              </span>
            )
          ) : (
            <span className={`ml-4 text-sm ${product.inStock ? 'text-[#1A936F]' : 'text-[#D7263D]'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-[#1A936F] hover:bg-[#15734D] text-white"
            size="lg"
            onClick={handleAddToCart}
            disabled={!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className={`flex-1 border-[#E5E7EB] ${isWishlisted ? 'text-[#D7263D] border-[#D7263D]' : 'text-[#6B7280]'}`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-[#D7263D]' : ''}`} />
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>
        
        <div className="mt-6">
          <Link 
            to={`/product/${product.slug}`}
            className="text-[#3D5AFE] hover:underline text-sm"
          >
            View full product details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;
