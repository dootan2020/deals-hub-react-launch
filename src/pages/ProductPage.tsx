import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Helmet } from 'react-helmet';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductPurchaseSection } from '@/components/product/ProductPurchaseSection';
import { ProductDescription } from '@/components/product/ProductDescription';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProductPageParams extends Record<string, string> {
  productSlug?: string;
}

const ProductPage = () => {
  const { productSlug } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories:category_id(*)')
          .eq('slug', productSlug)
          .maybeSingle();
        
        if (productError) throw productError;
        
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        const specifications: Record<string, string> = {};
          
        if (productData.specifications && typeof productData.specifications === 'object') {
          Object.entries(productData.specifications).forEach(([key, value]) => {
            specifications[key] = String(value);
          });
        }
        
        const mappedProduct: Product = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          shortDescription: productData.short_description || '',
          price: Number(productData.price),
          originalPrice: productData.original_price ? Number(productData.original_price) : undefined,
          images: productData.images || [],
          categoryId: productData.category_id,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
          inStock: productData.in_stock === true,
          stockQuantity: productData.stock_quantity ?? (productData.in_stock === true ? 10 : 0),
          badges: productData.badges || [],
          slug: productData.slug,
          features: productData.features || [],
          specifications,
          salesCount: Number(0),
          sales_count: Number(0),
          stock: productData.stock || 0,
          kiosk_token: productData.kiosk_token || '',
          createdAt: productData.created_at || new Date().toISOString()
        };
          
        setProduct(mappedProduct);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product information');
        toast({
          title: "Error",
          description: "There was a problem loading the product. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [productSlug, toast]);

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
        <div className="container-custom py-8 lg:py-12">
          <ProductHeader 
            title={product.title}
            category={product.categories}
          />

          <div className="max-w-4xl mx-auto">
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
