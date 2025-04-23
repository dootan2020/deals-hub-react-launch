
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface ProductPurchaseSectionProps {
  product: Product;
}

const ProductPurchaseSection: React.FC<ProductPurchaseSectionProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Availability:</span>
          <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          className="w-full"
          disabled={product.stock <= 0}
          onClick={() => {
            if (!isAuthenticated) {
              // Redirect to login or show login popup
              window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
              return;
            }
            // Handle purchase flow - will be implemented later
            alert('Purchase functionality will be implemented soon!');
          }}
        >
          {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Add to cart functionality - will be implemented later
            alert('Add to cart functionality will be implemented soon!');
          }}
        >
          Add to Cart
        </Button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span>Secure Payment</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
          </svg>
          <span>Instant Delivery</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseSection;
