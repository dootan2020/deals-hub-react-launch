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
import { buildProxyUrl, ProxyType, ProxyConfig, fetchViaProxy, fetchViaProxyWithFallback } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Category } from '@/types';
import { isHtmlResponse, extractFromHtml, normalizeProductInfo } from '@/utils/apiUtils';
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

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  originalPrice: z.coerce.number().positive('Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  category_id: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  kioskToken: z.string().optional(),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer')
});

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

type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ProductManagerPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const navigate = useNavigate();
  const [formDirty, setFormDirty] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      inStock: true,
      slug: '',
      category_id: '',
      images: '',
      kioskToken: '',
      stock: 0
    }
  });

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

  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const updateFormWithApiData = (data: ApiResponse, formData: any) => {
    if (!data) return formData;
    
    const updatedData = { ...formData };
    
    updatedData.title = data.name || formData.title;
    updatedData.description = data.description || `${data.name} - Digital Product` || formData.description;
    updatedData.price = parseFloat(data.price) || formData.price;
    updatedData.inStock = parseInt(data.stock || '0') > 0;
    updatedData.stock = parseInt(data.stock || '0');
    
    if (!formData.slug && data.name) {
      const slug = data.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      updatedData.slug = slug;
    }
    
    updatedData.kioskToken = kioskToken;
    
    return updatedData;
  };

  const handleFormSubmit = async (data: ProductFormValues, productId?: string) => {
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

      if (productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
          
        if (error) throw error;
      }
      
      setApiResponse(null);
      setRawResponse('');
      
      await fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      throw error;
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      inStock: true,
      slug: '',
      category_id: '',
      images: '',
      kioskToken: '',
      stock: 0
    });
    setFormDirty(false);
    toast.info('Form has been reset');
  };

  const handleResetForm = () => {
    if (form.formState.isDirty) {
      setShowResetConfirm(true);
    } else {
      resetForm();
    }
  };

  const handleApiTest = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);

    addLog(`Starting API test using ${selectedProxy} proxy...`);

    try {
      if (!kioskToken) {
        throw new Error('Kiosk Token is required');
      }

      // Create proper proxy configuration object
      const proxyConfig: ProxyConfig = { type: selectedProxy };
      
      // Format the API URL properly
      const url = `https://api.taphoammo.net/kioskapi.php?kiosk=${kioskToken}&usertoken=${userToken}`;
      
      addLog(`Requesting: ${url} through ${selectedProxy} proxy`);
      
      // Use the fetchViaProxy function with proper arguments
      try {
        let responseData;
        
        try {
          // First try with normal proxy
          responseData = await fetchViaProxy(url, proxyConfig);
          addLog(`Received response from ${selectedProxy} proxy`);
        } catch (proxyError) {
          // If that fails, try with the fallback method
          addLog(`${selectedProxy} proxy failed: ${proxyError.message}`);
          addLog('Attempting fallback method...');
          
          // Try the alternative approach with serverless function if available
          if (typeof fetchViaProxyWithFallback === 'function') {
            responseData = await fetchViaProxyWithFallback(url, proxyConfig);
            addLog('Fallback method succeeded');
          } else {
            // If no fallback available, show mock data
            throw proxyError;
          }
        }
        
        // Save the raw response for debugging
        setRawResponse(typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2));
        addLog(`Raw response received: ${JSON.stringify(responseData).substring(0, 50)}...`);
        
        // Handle HTML responses
        if (typeof responseData === 'string' && isHtmlResponse(responseData)) {
          addLog('Response is HTML, attempting to extract product information');
          const extractedData = extractFromHtml(responseData);
          setApiResponse(extractedData);
          setIsMockData(true);
        } else {
          // Handle JSON responses
          const normalizedData = normalizeProductInfo(responseData);
          setApiResponse(normalizedData);
          addLog('Successfully processed API response');
        }
        
        setLastUpdated(new Date().toLocaleString());
      } catch (requestError) {
        throw new Error(`API request failed: ${requestError.message}`);
      }
    } catch (err: any) {
      setError(`API request failed: ${err.message}`);
      addLog(`Error: ${err.message}`);
      
      // Show mock data when an error occurs
      setIsMockData(true);
      setApiResponse({
        success: 'mock',
        name: 'Sample Product (Mock)',
        price: '150000',
        stock: '10',
        description: 'This is mock data because the API request failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerlessFetch = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);

    addLog('Starting serverless API request...');

    try {
      if (!kioskToken) {
        throw new Error('Kiosk Token is required');
      }

      const response = await fetch('/api/product-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kioskToken, userToken })
      });

      if (!response.ok) {
        throw new Error(`Serverless function returned status ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
      setRawResponse(JSON.stringify(data, null, 2));
      setLastUpdated(new Date().toLocaleString());
      addLog('Successfully received and parsed serverless response');
    } catch (err: any) {
      setError(`Serverless request failed: ${err.message}`);
      addLog(`Error: ${err.message}`);
      
      setIsMockData(true);
      setApiResponse({
        success: 'mock',
        name: 'Sample Product (Mock)',
        price: '150000',
        stock: '10',
        description: 'This is mock data shown because the serverless function failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    toast.info('Logs cleared');
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
                            <SelectItem value="cors-anywhere">CORS Anywhere</SelectItem>
                            <SelectItem value="direct">Direct API Call</SelectItem>
                            <SelectItem value="yproxy">YProxy (AllOrigins Raw)</SelectItem>
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
                              stock: form.getValues('stock'),
                            });
                            
                            form.setValue('title', updatedFormData.title);
                            form.setValue('description', updatedFormData.description);
                            form.setValue('price', updatedFormData.price);
                            form.setValue('inStock', updatedFormData.inStock);
                            form.setValue('stock', updatedFormData.stock);
                            
                            if (!form.getValues('slug') || updatedFormData.slug) {
                              form.setValue('slug', updatedFormData.slug);
                            }
                            
                            form.setValue('kioskToken', updatedFormData.kioskToken);
                            
                            toast.success("API data applied to form");
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
                          name="kioskToken"
                          rules={{ required: "Kiosk Token is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Kiosk Token" {...field} />
                              </FormControl>
                              <FormDescription>
                                Token for API synchronization (required)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter stock quantity" {...field} />
                              </FormControl>
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
                    variant="outline"
                    onClick={handleResetForm}
                    className="border-gray-300 text-gray-600"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Form
                  </Button>
                  
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
