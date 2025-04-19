
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductPurchaseSection } from '@/components/product/ProductPurchaseSection';
import { ProductDescription } from '@/components/product/ProductDescription';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';

const ProductPage = () => {
  const { productSlug } = useParams();
  const { product, loading, error } = useProduct(productSlug);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error || 'Product not found'}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{product.title} | Digital Deals Hub</title>
        <meta name="description" content={product.shortDescription || product.description.substring(0, 160)} />
      </Helmet>
      
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 lg:py-12">
          <ProductHeader 
            title={product.title}
            category={product.categories}
          />

          <div className="max-w-6xl mx-auto">
            <ProductPurchaseSection product={product} />
            <div className="mt-8">
              <ProductDescription description={product.description} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
