
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductListingTable } from '@/components/admin/product-listing/ProductListingTable';
import { ProductFormManager, ProductFormValues } from '@/components/admin/product-listing/ProductFormManager';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, RefreshCw, AlertCircle, Info, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, ProxyType } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Category } from '@/types';

// Interfaces
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  category_id?: string | null;
  images?: string[];
  kiosk_token?: string | null;
  slug: string;
  created_at: string;
}

// API response type
type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ProductManagerPage = () => {
  // State for product management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // API Tester State
  const [kioskToken, setKioskToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadApiConfig();
  }, []);

  // Fetch products
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

  // Fetch categories
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

  // Load API config
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

  // Function to add log entry
  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  // Update form with API response data
  const updateFormWithApiData = (data: ApiResponse, formData: any) => {
    if (!data) return formData;
    
    const updatedData = { ...formData };
    
    // Update form values
    updatedData.title = data.name || formData.title;
    updatedData.description = data.description || `${data.name} - Digital Product` || '';
    updatedData.price = parseFloat(data.price) || formData.price;
    updatedData.inStock = parseInt(data.stock || '0') > 0;
    
    // Generate slug if not provided
    if (!formData.slug && data.name) {
      const slug = data.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      updatedData.slug = slug;
    }
    
    // Set the kiosk token
    updatedData.kioskToken = kioskToken;
    
    return updatedData;
  };

  const handleApiTest = async () => {
    if (!kioskToken || !userToken) {
      setError('Please enter both Kiosk Token and User Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);
    setLogs([]);
    
    try {
      addLog(`Testing with ${selectedProxy} proxy...`);
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}`;
      addLog(`API URL: ${apiUrl}`);
      
      const { url: proxyUrl } = buildProxyUrl(apiUrl, { type: selectedProxy });
      addLog(`Proxy URL: ${proxyUrl}`);
      
      try {
        const response = await fetch(proxyUrl);
        addLog(`Response status: ${response.status}`);
        addLog(`Content-Type: ${response.headers.get('content-type')}`);
        
        const responseText = await response.text();
        addLog(`Received ${responseText.length} bytes of data`);
        
        try {
          let parsedResponse = null;
          
          if (selectedProxy === 'allorigins' && responseText.includes('"contents"')) {
            const allOriginsData = JSON.parse(responseText);
            if (allOriginsData && allOriginsData.contents) {
              parsedResponse = JSON.parse(allOriginsData.contents);
            }
          } else {
            parsedResponse = JSON.parse(responseText);
          }
          
          if (parsedResponse) {
            addLog('Successfully retrieved and parsed data from API');
            setApiResponse(parsedResponse);
            setRawResponse(JSON.stringify(parsedResponse, null, 2));
            toast.success('Product information retrieved successfully');
          }
        } catch (parseError) {
          addLog(`Error parsing response: ${parseError}`);
          await handleServerlessFetch();
        }
      } catch (fetchError) {
        addLog(`Fetch error: ${fetchError}`);
        await handleServerlessFetch();
      }
      
      // Update timestamp
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      );
    } catch (error: any) {
      console.error('API test error:', error);
      setError(`Error: ${error.message || 'Unable to connect to API'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to use serverless function
  const handleServerlessFetch = async () => {
    if (!kioskToken || !userToken) {
      return;
    }
    
    addLog('Falling back to serverless function...');
    
    try {
      // URL to serverless function
      const serverlessUrl = `https://xcpwyvrlutlslgaueokd.supabase.co/functions/v1/api-proxy?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}&proxyType=${selectedProxy}`;
      addLog(`Calling serverless function: ${serverlessUrl.substring(0, 80)}...`);
      
      const response = await fetch(serverlessUrl);
      addLog(`Serverless function returned status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Serverless error: ${response.status}`);
      }
      
      const data = await response.json();
      addLog('Successfully retrieved data from serverless function');
      
      setApiResponse(data);
      setRawResponse(JSON.stringify(data, null, 2));
      setIsMockData(true);
      
      toast.success('Data successfully loaded from serverless function');
    } catch (error: any) {
      addLog(`Serverless error: ${error.message}`);
      setError(`Error: ${error.message}`);
      toast.error('Error connecting to serverless function');
    }
  };

  // Clear logs function
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Generate slug from title
  const generateSlug = (title: string) => {
    if (!title) return '';
    return title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Handle form submission
  const handleFormSubmit = async (data: ProductFormValues, productId?: string) => {
    try {
      // Prepare data for submission
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
      };

      if (productId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
          
        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert(productData);
          
        if (error) throw error;
      }
      
      // Reset API response data
      setApiResponse(null);
      setRawResponse('');
      
      // Refresh product list
      await fetchProducts();
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      throw error;
    }
  };
  
  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
      if (error) throw error;
      
      // Refresh product list
      setProducts(products.filter(p => p.id !== productId));
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      
      <ProductFormManager
        onSubmit={handleFormSubmit}
        categories={categories}
        initialProductData={selectedProduct}
      >
        {({ form, isSubmitting, isEditMode, resetForm, handleCancel, handleSubmit }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Tester Section */}
              <div className="space-y-6">
                <Card className="border border-gray-200">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">API Product Lookup</h3>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label htmlFor="kioskToken" className="block text-sm font-medium mb-2">
                          Kiosk Token
                        </label>
                        <Input 
                          id="kioskToken"
                          value={kioskToken}
                          onChange={(e) => {
                            setKioskToken(e.target.value);
                            if (!isEditMode) {
                              form.setValue('kioskToken', e.target.value);
                            }
                          }}
                          placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="userToken" className="block text-sm font-medium mb-2">
                          User Token
                        </label>
                        <Input 
                          id="userToken"
                          value={userToken}
                          onChange={(e) => setUserToken(e.target.value)}
                          placeholder="Enter User Token"
                          className="w-full"
                          type="password"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 items-end mb-4">
                      <div className="w-full">
                        <label htmlFor="corsProxy" className="block text-sm font-medium mb-2">
                          CORS Proxy
                        </label>
                        <Select 
                          value={selectedProxy} 
                          onValueChange={(value) => setSelectedProxy(value as ProxyType)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select proxy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allorigins">AllOrigins</SelectItem>
                            <SelectItem value="corsproxy">CORS Proxy</SelectItem>
                            <SelectItem value="corsanywhere">CORS Anywhere</SelectItem>
                            <SelectItem value="direct">Direct API Call</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full">
                        <Button 
                          onClick={handleApiTest} 
                          disabled={isLoading}
                          variant="secondary"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
                          Test API
                        </Button>
                        
                        <Button 
                          onClick={handleServerlessFetch} 
                          disabled={isLoading}
                          variant="outline"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Use Serverless
                        </Button>
                        
                        <Button 
                          onClick={clearLogs} 
                          variant="outline"
                          className="border-gray-300 text-gray-600"
                        >
                          Clear Logs
                        </Button>
                      </div>
                    </div>
                    
                    {error && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {isMockData && apiResponse && (
                      <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200">
                        <Info className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-700">
                          Displaying sample data because the API returned HTML or encountered a CORS error
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {apiResponse && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground mb-1">Product name:</div>
                              <div className="font-medium text-green-700">{apiResponse.name}</div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground mb-1">Price:</div>
                              <div className="font-medium text-blue-700">
                                {Number(apiResponse.price).toLocaleString()} VND
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="pt-4">
                              <div className="text-sm text-muted-foreground mb-1">Stock:</div>
                              <div className="font-medium text-purple-700">{apiResponse.stock}</div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Button 
                          onClick={() => {
                            const updatedFormData = updateFormWithApiData(apiResponse, {
                              title: form.getValues('title'),
                              description: form.getValues('description'),
                              price: form.getValues('price'),
                              inStock: form.getValues('inStock'),
                              slug: form.getValues('slug'),
                            });
                            
                            form.setValue('title', updatedFormData.title);
                            form.setValue('description', updatedFormData.description);
                            form.setValue('price', updatedFormData.price);
                            form.setValue('inStock', updatedFormData.inStock);
                            form.setValue('slug', updatedFormData.slug);
                            form.setValue('kioskToken', updatedFormData.kioskToken);
                          }}
                          type="button"
                          className="w-full"
                          variant="secondary"
                        >
                          Apply API Data to Form
                        </Button>
                      </div>
                    )}
                    
                    {logs.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">API Request Logs</div>
                          <div className="text-xs text-muted-foreground">{logs.length} entries</div>
                        </div>
                        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                          {logs.map((log, index) => (
                            <div key={index}>{log}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Product Form Section */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter product title" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (!isEditMode && !form.getValues('slug')) {
                                      form.setValue('slug', generateSlug(e.target.value));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter product description" 
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (VND)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="originalPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Original Price (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Original price (for discounts)" 
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Leave empty if there's no discount
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <div className="flex space-x-2">
                                  <FormControl>
                                    <Input placeholder="product-url-slug" {...field} />
                                  </FormControl>
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => form.setValue('slug', generateSlug(form.getValues('title')))}
                                  >
                                    Generate
                                  </Button>
                                </div>
                                <FormDescription>
                                  URL-friendly version of the product name
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories && categories.map((category) => (
                                      <SelectItem 
                                        key={category.id} 
                                        value={category.id}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="images"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Images</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter image URLs (one per line)" 
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter one image URL per line
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="inStock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Product Availability
                                </FormLabel>
                                <FormDescription>
                                  Is this product in stock?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="kioskToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kiosk Token</FormLabel>
                              <FormControl>
                                <Input placeholder="Kiosk Token" {...field} />
                              </FormControl>
                              <FormDescription>
                                Token for API synchronization
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-2">
                  {isEditMode && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  <Button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} 
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Product' : 'Save Product'
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Product Listing Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Products ({products.length})</h2>
                <Button 
                  variant="outline"
                  onClick={fetchProducts}
                  disabled={isLoadingProducts}
                >
                  {isLoadingProducts ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          </div>
        )}
      </ProductFormManager>
    </AdminLayout>
  );
};

export default ProductManagerPage;
