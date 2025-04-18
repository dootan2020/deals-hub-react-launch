
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductListingTable } from '@/components/admin/product-listing/ProductListingTable';
import { ApiTester } from '@/components/admin/product-manager/ApiTester';
import { ProductFormSection, ProductFormValues, ApiResponse } from '@/components/admin/product-manager/ProductFormSection';
import { Category } from '@/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  category_id?: string | null;
  created_at: string;
  slug: string;
  description: string;
  images?: string[];
  kiosk_token?: string | null;
  stock: number;
}

const ProductManagerPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [kioskToken, setKioskToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadApiConfig();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const loadApiConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('api_configs')
        .select('user_token, kiosk_token')
        .eq('is_active', true)
        .single();
        
      if (data) {
        setUserToken(data.user_token || '');
        setKioskToken(data.kiosk_token || '');
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    }
  };

  const handleFormSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice,
        in_stock: data.inStock,
        slug: data.slug,
        category_id: data.category_id,
        images: data.images ? data.images.split('\n').filter(url => url.trim()) : [],
        kiosk_token: data.kioskToken,
        api_name: apiResponse?.name,
        api_price: apiResponse ? parseFloat(apiResponse.price) : null,
        api_stock: apiResponse ? parseInt(apiResponse.stock) : null,
        stock: data.stock
      };

      if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);
          
        if (error) throw error;
        
        toast.success('Product updated successfully');
        setSelectedProduct(null);
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
          
        if (error) throw error;
        
        toast.success('Product created successfully');
      }
      
      setApiResponse(null);
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiDataReceived = (data: ApiResponse) => {
    setApiResponse(data);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message}`);
      throw error;
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setKioskToken(product.kiosk_token || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setApiResponse(null);
  };

  const resetForm = () => {
    setShowResetConfirm(false);
    setSelectedProduct(null);
    setApiResponse(null);
  };

  return (
    <AdminLayout title="Product Manager">
      <Card className="border-primary/20 bg-primary/5 mb-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-primary mb-1">Product Manager</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage products with automatic API data retrieval
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ApiTester 
          onApiDataReceived={handleApiDataReceived} 
          initialKioskToken={kioskToken}
          initialUserToken={userToken}
        />
        
        <ProductFormSection 
          categories={categories}
          onSubmit={handleFormSubmit}
          apiResponse={apiResponse}
          isSubmitting={isSubmitting}
          isEditMode={!!selectedProduct}
          onRequestResetConfirm={() => setShowResetConfirm(true)}
          onKioskTokenChange={setKioskToken}
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Products ({products.length})</h2>
          <Button 
            variant="outline"
            onClick={fetchProducts}
            disabled={isLoadingProducts}
          >
            {isLoadingProducts ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
        
        <ProductListingTable
          products={products}
          categories={categories}
          isLoading={isLoadingProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>

      <AlertDialog 
        open={showResetConfirm} 
        onOpenChange={setShowResetConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form fields and unsaved changes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetForm}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ProductManagerPage;
