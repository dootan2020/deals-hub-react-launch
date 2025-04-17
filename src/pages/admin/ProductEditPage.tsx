
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, InfoIcon } from 'lucide-react';

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [productExists, setProductExists] = useState(false);
  const [productName, setProductName] = useState<string>('');

  useEffect(() => {
    if (id) {
      checkProductExists();
    }
  }, [id]);

  const checkProductExists = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProductExists(!!data);
      if (data?.title) {
        setProductName(data.title);
      }
    } catch (error) {
      console.error('Error checking product:', error);
      toast.error('Product not found');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center h-64">
          <p>Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!productExists) {
    return (
      <AdminLayout title="Edit Product">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Product not found. The requested product might have been deleted.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit Product: ${productName}`}>
      <div className="space-y-6">
        <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertDescription className="text-amber-700">
            <p className="font-medium">API Connection Notes</p>
            <p className="mt-1">Our system uses CORS proxies to fetch product data. If you encounter any issues with HTML responses, try switching to a different proxy in the dropdown menu.</p>
          </AlertDescription>  
        </Alert>
        
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <p className="font-medium">New Product Fields</p>
            <p className="mt-1">You can now add a short description and specify stock quantity in the product form. The short description will be shown in the product summary section.</p>
          </AlertDescription>  
        </Alert>
        
        <ProductForm productId={id} />
      </div>
    </AdminLayout>
  );
};

export default ProductEditPage;
