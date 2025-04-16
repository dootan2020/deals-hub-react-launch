
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductSync } from '@/hooks/use-product-sync';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/types';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.string().min(1).refine(val => !isNaN(parseFloat(val)), {
    message: 'Price must be a valid number.',
  }),
  originalPrice: z.string().optional().refine(val => !val || !isNaN(parseFloat(val)), {
    message: 'Original price must be a valid number.',
  }),
  inStock: z.boolean().default(true),
  slug: z.string().min(3, 'Slug must be at least 3 characters.')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  externalId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  kioskToken: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProductInfo, setIsLoadingProductInfo] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { createProduct, updateProduct } = useProductSync();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      inStock: true,
      slug: '',
      externalId: '',
      categoryId: '',
      images: '',
      kioskToken: '',
    }
  });

  useEffect(() => {
    fetchCategories();
    
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

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

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (data) {
        form.reset({
          title: data.title,
          description: data.description,
          price: String(data.price),
          originalPrice: data.original_price ? String(data.original_price) : '',
          inStock: data.in_stock ?? true,
          slug: data.slug,
          externalId: data.external_id || '',
          categoryId: data.category_id || '',
          images: data.images && data.images.length > 0 ? data.images.join('\n') : '',
          kioskToken: data.kiosk_token || '',
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (formData: ProductFormValues) => {
    setIsLoading(true);
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        in_stock: formData.inStock,
        slug: formData.slug,
        external_id: formData.externalId || null,
        category_id: formData.categoryId,
        images: formData.images ? formData.images.split('\n').filter(url => url.trim() !== '') : [],
        kiosk_token: formData.kioskToken || null,
      };

      if (productId) {
        await updateProduct({ id: productId, ...productData });
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', value);
  };

  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    form.setValue('slug', slug);
  };

  const fetchProductInfo = async () => {
    const kioskToken = form.getValues('kioskToken');
    
    if (!kioskToken) {
      toast.error('Please enter a Kiosk Token');
      return;
    }

    setIsLoadingProductInfo(true);
    try {
      // Get API config to retrieve userToken
      const { data: apiConfigs, error: configError } = await supabase
        .from('api_configs')
        .select('user_token')
        .eq('is_active', true)
        .limit(1);

      if (configError || !apiConfigs || apiConfigs.length === 0) {
        throw new Error('No active API configuration found. Please set up API configuration first.');
      }

      const userToken = apiConfigs[0].user_token;
      
      // Call the API to get product info
      const response = await fetch(`/functions/v1/product-sync?action=check&kioskToken=${kioskToken}&userToken=${userToken}`);
      const data = await response.json();

      if (data.success === 'true') {
        // Autofill form with returned data
        form.setValue('title', data.name || '');
        form.setValue('price', data.price || '0');
        form.setValue('inStock', parseInt(data.stock || '0') > 0);
        
        // Generate slug from product name if title was empty before
        if (!form.getValues('slug') && data.name) {
          const slug = data.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          form.setValue('slug', slug);
        }
        
        toast.success('Product information retrieved successfully');
      } else {
        toast.error(`Failed to retrieve product information: ${data.description || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error fetching product info:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoadingProductInfo(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Kiosk Token - Moved to the top and added "Get Info" button */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-8">
          <FormField
            control={form.control}
            name="kioskToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Kiosk Token</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter kiosk token for product lookup" 
                      className="flex-grow"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={fetchProductInfo}
                    disabled={isLoadingProductInfo}
                    className="whitespace-nowrap"
                  >
                    {isLoadingProductInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Product Info
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a valid kiosk token to automatically retrieve product information from the API.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter product title" />
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
                  {...field} 
                  placeholder="Enter product description" 
                  className="min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" />
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
                <FormLabel>Original Price ($) (optional)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <FormLabel className="text-base">In Stock</FormLabel>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="product-slug" 
                      onChange={(e) => {
                        handleSlugChange(e);
                      }} 
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlugFromTitle}
                  >
                    Generate
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="externalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External ID (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="External product ID" />
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
              <FormLabel>Image URLs (one per line)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                  className="min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
