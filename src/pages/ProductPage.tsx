
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductDescription } from '@/components/product/ProductDescription';
import ProductPurchaseSection from '@/components/product/ProductPurchaseSection';
import { useProduct } from '@/hooks/useProduct';

const ProductPage: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { product, loading, error } = useProduct(productSlug || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-500">Error</h2>
            <p className="mt-2">{error || 'Product not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ProductHeader title={product.title} category={product.category} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ProductDescription description={product.description || ''} />
          </div>
          <div>
            <ProductPurchaseSection product={product} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
