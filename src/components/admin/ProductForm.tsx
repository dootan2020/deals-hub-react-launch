import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoaderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ApiResponse, Category, Product } from '@/types';
import { prepareQueryId, prepareInsert, prepareUpdate, castArrayData } from '@/utils/supabaseHelpers';

const ImageUpload = ({ value, onChange }: { value?: string[] | null, onChange: (value: string[]) => void }) => {
  return (
    <Textarea 
      placeholder="Enter image URLs (one per line)"
      value={(value || []).join('\n')}
      onChange={(e) => {
        const urls = e.target.value
          .split('\n')
          .map(url => url.trim())
          .filter(url => url !== '');
        onChange(urls);
      }}
      className="h-32"
    />
  );
};

const ApiProductTester = ({ onSelectResult }: { onSelectResult: (result: ApiResponse) => void }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const testApi = async () => {
    setLoading(true);
    try {
      // Simulate API test
      setTimeout(() => {
        onSelectResult({
          success: 'true',
          name: 'Test Product',
          price: '19.99',
          stock: '100',
          description: 'This is a test product from API'
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('API test error:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input 
          placeholder="Enter API URL to test" 
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={testApi} disabled={loading || !apiUrl}>
          {loading ? 'Testing...' : 'Test API'}
        </Button>
      </div>
    </div>
  );
};

const productFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.number(),
  original_price: z.number().optional(),
  in_stock: z.boolean().default(true),
  slug: z.string().regex(/^[a-z0-9-]+$/, {
    message: "Slug must be lowercase and contain only letters, numbers, and dashes.",
  }),
  external_id: z.string().optional(),
  category_id: z.string().uuid({
    message: "Category ID must be a valid UUID.",
  }),
  images: z.string().array().default([]),
  kiosk_token: z.string().optional(),
  stock: z.number().min(0, {
    message: "Stock must be a non-negative number.",
  }),
});

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      original_price: 0,
      in_stock: true,
      slug: '',
      external_id: '',
      category_id: '',
      images: [],
      kiosk_token: '',
      stock: 0,
    },
  });

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) {
          toast.error("Failed to load product");
          console.error(error);
        } else {
          form.reset({
            title: data.title,
            description: data.description,
            price: data.price,
            original_price: data.original_price || undefined,
            in_stock: data.in_stock,
            slug: data.slug,
            external_id: data.external_id || '',
            category_id: data.category_id,
            images: data.images || [],
            kiosk_token: data.kiosk_token || '',
            stock: data.stock,
          });
        }
        setLoading(false);
      };
      
      fetchProduct();
    }
  }, [productId, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast.error("Failed to load categories");
        console.error(error);
      } else {
        setCategories(castArrayData<Category>(data));
      }
    };
    
    fetchCategories();
  }, []);

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    setLoading(true);
    
    try {
      const productData = {
        title: values.title,
        description: values.description,
        price: values.price,
        original_price: values.original_price,
        in_stock: values.in_stock,
        slug: values.slug,
        external_id: values.external_id,
        category_id: values.category_id,
        images: values.images,
        kiosk_token: values.kiosk_token,
        stock: values.stock,
      };
      
      if (productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
          
        if (error) throw error;
        
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
        
        toast.success("Product created successfully");
      }
      
      if (onSuccess) onSuccess();
      
      if (!productId) {
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiResult = (result: ApiResponse) => {
    if (result.success === 'true') {
      form.setValue('title', result.name || '');
      form.setValue('price', Number(result.price) || 0);
      form.setValue('stock', Number(result.stock) || 0);
      form.setValue('description', result.description || '');
      toast.success("API data loaded successfully!");
    } else {
      toast.error(`API test error: ${result.error || 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
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
                      <Textarea
                        placeholder="Product description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="product-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="external_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External ID</FormLabel>
                    <FormControl>
                      <Input placeholder="External ID" {...field} />
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
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kiosk_token"
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
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="in_stock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In Stock</FormLabel>
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
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            API Product Tester
          </h3>
          <ApiProductTester onSelectResult={handleApiResult} />
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;
