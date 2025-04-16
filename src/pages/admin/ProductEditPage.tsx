
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [productExists, setProductExists] = useState(false);

  useEffect(() => {
    if (id) {
      checkProductExists();
    }
  }, [id]);

  const checkProductExists = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProductExists(!!data);
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
    <AdminLayout title="Edit Product">
      <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <p className="font-medium">API Connection Note</p>
          <p className="mt-1">Make sure to use a valid Kiosk Token and User Token to fetch product information from TapHoaMMO. If you encounter any issues, check your API settings in the API Config page.</p>
        </AlertDescription>  
      </Alert>
      
      <ProductForm productId={id} />
    </AdminLayout>
  );
};

export default ProductEditPage;
