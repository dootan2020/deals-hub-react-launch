import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { SearchableCategorySelect } from '@/components/admin/SearchableCategorySelect';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  originalPrice: z.coerce.number().positive('Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(1, 'Slug is required'),
  category_id: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  kioskToken: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ProductManagerPage = () => {
  const [kioskToken, setKioskToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const navigate = useNavigate();

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
      kioskToken: ''
    }
  });

  useEffect(() => {
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
          form.setValue('kioskToken', data.kiosk_token || '');
        }
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    };
    
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setCategories(data || []);
      }
    };

    loadApiConfig();
    loadCategories();
  }, [form]);

  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  const updateFormWithApiData = (data: ApiResponse) => {
    if (!data) return;
    
    form.setValue('title', data.name || form.getValues('title'));
    form.setValue('description', data.description || `${data.name} - Digital Product` || '');
    form.setValue('price', parseFloat(data.price) || form.getValues('price'));
    form.setValue('inStock', parseInt(data.stock || '0') > 0);
    
    if (!form.getValues('slug') && data.name) {
      const slug = data.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      form.setValue('slug', slug);
    }
    
    form.setValue('kioskToken', kioskToken);
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
            updateFormWithApiData(parsedResponse);
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

  const handleServerlessFetch = async () => {
    if (!kioskToken || !userToken) {
      return;
    }
    
    addLog('Falling back to serverless function...');
    
    try {
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
      updateFormWithApiData(data);
      
      toast.success('Data successfully loaded from serverless function');
    } catch (error: any) {
      addLog(`Serverless error: ${error.message}`);
      setError(`Error: ${error.message}`);
      toast.error('Error connecting to serverless function');
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSaving(true);
    
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
      };

      const { data: createdProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Product created successfully!');
      
      form.reset({
        title: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        inStock: true,
        slug: '',
        category_id: '',
        images: '',
        kioskToken: ''
      });
      
      setApiResponse(null);
      setRawResponse('');
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(`Failed to create product: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
      
    form.setValue('slug', slug);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AdminLayout title="Product Manager">
      <Card className="border-primary/20 bg-primary/5 mb-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-primary mb-1">Product Manager</h1>
          <p className="text-muted-foreground">
            Add new products with automatic API data retrieval
          </p>
        </CardContent>
      </Card>
      
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
                      form.setValue('kioskToken', e.target.value);
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
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
                    Test API
                  </Button>
                  
                  <Button 
                    onClick={handleServerlessFetch} 
                    disabled={isLoading}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Product Details</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product title" {...field} />
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
                                {...field}
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
                                onClick={generateSlug}
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
                            <FormControl>
                              <SearchableCategorySelect
                                categories={categories}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Search for a category"
                              />
                            </FormControl>
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
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductManagerPage;
