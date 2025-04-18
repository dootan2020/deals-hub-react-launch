
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiProductTester } from '@/components/admin/product-manager/ApiProductTester';
import { ProductForm } from '@/components/admin/product-manager/ProductForm';
import { ProductListView } from '@/components/admin/product-manager/ProductListView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Category } from '@/types';
import { fetchActiveApiConfig } from '@/utils/apiUtils';
import { InfoIcon } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  in_stock: boolean;
  category_id: string;
  slug: string;
  description: string;
  stock: number;
  kiosk_token?: string;
  last_synced_at?: string;
  created_at: string;
  [key: string]: any;
}

interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
}

const ProductManagerPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastApiResponse, setLastApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleApiDataReceived = (data: ApiResponse) => {
    setLastApiResponse(data);
    
    if (activeTab === 'create') {
      // Auto-populate form with product data
      if (data) {
        toast.success(`Retrieved product data: ${data.name}`);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('edit');
  };

  const handleProductSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        original_price: formData.originalPrice || null,
        in_stock: formData.inStock,
        slug: formData.slug,
        external_id: formData.externalId || null,
        category_id: formData.categoryId,
        images: formData.images ? formData.images.split('\n').filter((url: string) => url.trim() !== '') : [],
        kiosk_token: formData.kioskToken || null,
        stock: formData.stock || 0,
      };

      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
        
        // Reset and go back to products list
        setSelectedProduct(null);
        setActiveTab('products');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
        
        // Reset form and stay on create tab
        setActiveTab('products');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiTest = async (kioskToken: string) => {
    setIsLoading(true);
    try {
      toast.info('Fetching product data...');

      // Get the user token from API config
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token;
      
      // Call the serverless function directly
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: { 
          endpoint: 'getStock',
          kioskToken,
          userToken
        }
      });
      
      if (error) {
        throw new Error(`Serverless function error: ${error.message}`);
      }
      
      if (data) {
        // Update state with the API data
        setLastApiResponse(data);
        toast.success('Product data fetched successfully!');
        return data;
      } else {
        toast.error('Failed to fetch product data: Empty response');
        return null;
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error(`Error fetching product data: ${(error as Error).message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProduct = async (product: Product) => {
    if (!product.kiosk_token) {
      toast.error(`No Kiosk Token available for ${product.title}`);
      return;
    }

    try {
      // Get the user token from API config
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token;
      
      // Call the serverless function directly
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: { 
          endpoint: 'getStock',
          kioskToken: product.kiosk_token,
          userToken
        }
      });
      
      if (error) {
        throw new Error(`Serverless function error: ${error.message}`);
      }
      
      if (!data || data.success !== "true") {
        throw new Error(data?.error || 'API returned error or empty response');
      }
      
      // Update product in database
      const { error: updateError } = await supabase
        .from('products')
        .update({
          api_name: data.name,
          api_price: parseFloat(data.price),
          api_stock: parseInt(data.stock || '0'),
          stock: parseInt(data.stock || '0'),
          last_synced_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) throw updateError;
      
      // Log the sync
      await supabase
        .from('sync_logs')
        .insert({
          product_id: product.id,
          action: 'product_sync',
          status: 'success',
          message: `Synced: ${data.name}, Price: ${data.price}, Stock: ${data.stock}`
        });
        
      toast.success(`Product "${product.title}" synced successfully`);
    } catch (error) {
      console.error('Sync error:', error);
      
      // Log the error
      await supabase
        .from('sync_logs')
        .insert({
          product_id: product.id,
          action: 'product_sync',
          status: 'error',
          message: `Error: ${(error as Error).message}`
        });
        
      toast.error(`Failed to sync ${product.title}: ${(error as Error).message}`);
    }
  };

  const handleSyncAll = async () => {
    try {
      // Get all products with kiosk tokens
      const { data: productsWithTokens, error } = await supabase
        .from('products')
        .select('*')
        .not('kiosk_token', 'is', null);
        
      if (error) throw error;
      
      if (!productsWithTokens || productsWithTokens.length === 0) {
        toast.warning('No products with kiosk tokens found');
        return;
      }
      
      toast.info(`Starting sync for ${productsWithTokens.length} products...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Get user token
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token;
      
      // Process each product
      for (const product of productsWithTokens) {
        try {
          // Call the serverless function directly
          const { data, error } = await supabase.functions.invoke('api-proxy', {
            body: { 
              endpoint: 'getStock',
              kioskToken: product.kiosk_token,
              userToken
            }
          });
          
          if (error) {
            throw new Error(`Serverless function error: ${error.message}`);
          }
          
          if (!data || data.success !== "true") {
            throw new Error(data?.error || 'API returned error or empty response');
          }
          
          // Update product
          await supabase
            .from('products')
            .update({
              api_name: data.name,
              api_price: parseFloat(data.price),
              api_stock: parseInt(data.stock || '0'),
              stock: parseInt(data.stock || '0'),
              last_synced_at: new Date().toISOString()
            })
            .eq('id', product.id);
            
          await supabase
            .from('sync_logs')
            .insert({
              product_id: product.id,
              action: 'bulk_sync',
              status: 'success',
              message: `Synced: ${data.name}, Price: ${data.price}, Stock: ${data.stock}`
            });
            
          successCount++;
        } catch (error) {
          console.error(`Error syncing ${product.title}:`, error);
          
          await supabase
            .from('sync_logs')
            .insert({
              product_id: product.id,
              action: 'bulk_sync',
              status: 'error',
              message: `Error: ${(error as Error).message}`
            });
            
          errorCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
      
      toast.success(`Sync completed: ${successCount} success, ${errorCount} failed`);
    } catch (error) {
      console.error('Error in bulk sync:', error);
      toast.error(`Sync error: ${(error as Error).message}`);
    }
  };

  return (
    <AdminLayout title="Product Manager">
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Product Manager</CardTitle>
                <CardDescription>
                  Add, edit, and manage your products with API integration for automatic data retrieval.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {categories.length} Categories
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-blue-700">
            This page allows you to manage digital products with automatic data retrieval from the TapHoaMMO API. You can create, edit, and sync products with real-time stock and price information.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products List</TabsTrigger>
            <TabsTrigger value="create">Add New Product</TabsTrigger>
            <TabsTrigger value="edit" disabled={!selectedProduct}>
              {selectedProduct ? 'Edit Product' : 'Edit Product'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <ProductListView 
              onEdit={handleEditProduct} 
              onSync={handleSyncProduct}
              onSyncAll={handleSyncAll}
              categories={categories}
            />
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ApiProductTester 
                  onApiDataReceived={handleApiDataReceived}
                />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>
                      Create a new product with API data or manual entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProductForm
                      onApiTest={handleApiTest}
                      onApiDataReceived={handleApiDataReceived}
                      onSubmit={handleProductSubmit}
                      categories={categories}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ApiProductTester 
                    initialKioskToken={selectedProduct.kiosk_token || ''}
                    onApiDataReceived={handleApiDataReceived}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Product</CardTitle>
                      <CardDescription>
                        Edit product "{selectedProduct.title}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProductForm
                        productId={selectedProduct.id}
                        onApiTest={handleApiTest}
                        onApiDataReceived={handleApiDataReceived}
                        onSubmit={handleProductSubmit}
                        categories={categories}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default ProductManagerPage;
