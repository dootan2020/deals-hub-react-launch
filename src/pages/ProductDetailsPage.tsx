
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductDetails } from '@/hooks/useProductDetails';
import ProductPurchaseSection from '@/components/product/ProductPurchaseSection';
import PurchaseDialog from '@/components/checkout/PurchaseDialog';
import { Loader2 } from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProductDetails(slug);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl text-red-600 font-medium mb-2">Error</h2>
          <p className="text-red-700">{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <div className="aspect-w-1 aspect-h-1 w-full">
            {product.images && product.images[0] && (
              <img 
                src={product.images[0]} 
                alt={product.title}
                className="w-full h-full object-cover" 
              />
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="text-sm text-gray-500 mt-1">Category: {product.category}</div>
          </div>
          
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>
          
          <ProductPurchaseSection product={product} />
        </div>
      </div>
      
      {product && (
        <PurchaseDialog 
          product={product}
          isOpen={isPurchaseDialogOpen}
          onClose={() => setIsPurchaseDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;
