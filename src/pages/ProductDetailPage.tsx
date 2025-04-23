
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Product } from '@/types';
import { BuyNowButton } from '@/components/checkout/BuyNowButton';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/helpers';

const ProductDetailPage = () => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');
        
        // Try to find by ID first
        if (id) {
          query = query.eq('id', id);
        } 
        // If no ID but slug is provided, use that
        else if (slug) {
          query = query.eq('slug', slug);
        } else {
          throw new Error('No product identifier provided');
        }
        
        const { data, error } = await query.single();
        
        if (error) throw error;
        if (!data) throw new Error('Product not found');
        
        setProduct(data);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, slug]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center min-h-[60vh] flex flex-col justify-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p>The product you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={product.title}>
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4">
            {product.images && product.images[0] ? (
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="max-h-96 object-contain" 
              />
            ) : (
              <div className="h-96 w-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="text-gray-500 mt-1">{product.category}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div className="prose max-w-none">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="text-gray-500">No description available</p>
                )}
              </div>
            </div>
            
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Availability:</span>
                <span className="font-medium text-green-600">In Stock</span>
              </div>
              
              <BuyNowButton 
                productId={product.id}
                className="w-full"
                onPurchaseSuccess={() => {
                  toast.success('Purchase Complete', 'Thank you for your order!');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
