
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
import { buildProxyUrl } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useProductSync } from '@/hooks/use-product-sync';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

// Explicitly define the enum here since we're using it as a value
enum ProxyTypeEnum {
  Mobile = 'Mobile',
  Residential = 'Residential',
  Dedicated = 'Dedicated'
}

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').transform((v) => sanitizeHtml(v)),
  description: z.string().min(1, 'Description is required').transform((v) => sanitizeHtml(v)),
  price: z.coerce.number().positive('Price must be positive'),
  originalPrice: z.coerce.number().positive('Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(1, 'Slug is required').transform((v) => sanitizeHtml(v)),
  category_id: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).default([]),
  kioskToken: z.string().optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductFormWithTester = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [proxyType, setProxyType] = useState<ProxyTypeEnum>(ProxyTypeEnum.Mobile);
  const [proxyUrl, setProxyUrl] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [kioskToken, setKioskToken] = useState('');
  const navigate = useNavigate();
  const { syncProduct } = useProductSync();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 1,
      originalPrice: 1,
      inStock: true,
      slug: '',
      category_id: '',
      images: [],
      kioskToken: ''
    },
    mode: 'onChange'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name');

        if (error) {
          console.error('Error fetching categories:', error);
          toast.error(`Error fetching categories: ${error.message}`);
        }

        if (data) {
          setCategories(data);
          if (data.length > 0) {
            form.setValue('category_id', data[0].id);
          }
        }
      } catch (error: any) {
        console.error('Unexpected error fetching categories:', error);
        toast.error(`Unexpected error fetching categories: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [form]);

  const handleProxyTypeChange = (type: ProxyTypeEnum) => {
    setProxyType(type);
  };

  const handleTestProxy = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Fix: Pass both arguments to buildProxyUrl and extract just the url property
      const proxyResult = buildProxyUrl(proxyType.toString(), { type: proxyType.toString() });
      const url = proxyResult.url;
      setProxyUrl(url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult(result);

      if (response.ok) {
        toast.success('Proxy test successful!');
      } else {
        toast.error(`Proxy test failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Proxy test error:', error);
      toast.error(`Proxy test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    console.log("Form values", values);
    try {
      // Fix: Pass proper product data object instead of string
      await syncProduct({
        id: 'new',
        title: values.title,
        description: values.description,
        price: values.price,
        originalPrice: values.originalPrice,
        inStock: values.inStock,
        slug: values.slug,
        category_id: values.category_id,
        stockQuantity: 10,
        images: values.images || [],
        specifications: {},
        kiosk_token: values.kioskToken || '',
        // Add all required fields for Product type
        categoryId: values.category_id,
        rating: 0,
        reviewCount: 0,
        badges: [],
        features: [],
        createdAt: new Date().toISOString(),
        stock: 10,
        shortDescription: ''
      });
      toast.success('Product created successfully!');
      navigate('/admin/product-manager');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(`Error creating product: ${error.message}`);
    }
  };

  return (
    <AdminLayout title="Create Product with Tester">
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Create Product with Tester</h1>

        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Product title" {...field} />
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
                        <Textarea placeholder="Product description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Product price" {...field} />
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
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Original price" {...field} />
                      </FormControl>
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
                        <FormLabel>In Stock</FormLabel>
                        <FormDescription>
                          Whether the product is currently in stock.
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="Product slug" {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Proxy Tester</h2>
          <Card>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="proxyType">Proxy Type</Label>
                  <Select value={proxyType} onValueChange={handleProxyTypeChange}>
                    <SelectTrigger id="proxyType">
                      <SelectValue placeholder="Select Proxy Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProxyTypeEnum.Mobile}>Mobile</SelectItem>
                      <SelectItem value={ProxyTypeEnum.Residential}>Residential</SelectItem>
                      <SelectItem value={ProxyTypeEnum.Dedicated}>Dedicated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleTestProxy} disabled={isTesting}>
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Proxy'
                  )}
                </Button>

                {proxyUrl && (
                  <div>
                    <Label>Proxy URL</Label>
                    <Input type="text" value={proxyUrl} readOnly />
                  </div>
                )}

                {testResult && (
                  <div>
                    <Label>Test Result</Label>
                    <Textarea value={JSON.stringify(testResult, null, 2)} readOnly className="min-h-[100px]" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductFormWithTester;
