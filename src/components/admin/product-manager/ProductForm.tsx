
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem,
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, RefreshCw } from 'lucide-react';
import { Category } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiResponse } from '@/components/admin/product-manager/ApiProductTester';
import { prepareQueryId, prepareDataForInsert, castData } from '@/utils/supabaseHelpers';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  originalPrice: z.coerce.number().min(0, 'Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(3, 'Slug must be at least 3 characters.')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  externalId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  kioskToken: z.string().min(1, 'Kiosk Token is required'),
  stock: z.number().int().min(0, 'Stock must be a positive number'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onApiTest?: (kioskToken: string) => Promise<void>;
  onApiDataReceived?: (data: ApiResponse) => void;
  productId?: string;
  onSubmit?: (data: ProductFormValues) => Promise<void>;
  categories: Category[];
}

export function ProductForm({ 
  onApiTest, 
  productId, 
  onSubmit,
  onApiDataReceived,
  categories 
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
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
      externalId: '',
      categoryId: '',
      images: '',
      kioskToken: '',
      stock: 0,
    },
    mode: 'onChange'
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setFormDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  useEffect(() => {
    if (onApiDataReceived) {
      const handleExternalApiData = (data: ApiResponse) => {
        handleApiData(data);
      };

      const handleApiDataEvent = (event: CustomEvent<ApiResponse>) => {
        handleExternalApiData(event.detail);
      };

      window.addEventListener('apiDataReceived' as any, handleApiDataEvent as any);

      return () => {
        window.removeEventListener('apiDataReceived' as any, handleApiDataEvent as any);
      };
    }
  }, [onApiDataReceived]);

  const fetchProductDetails = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', prepareQueryId(productId))
        .single();

      if (error) throw error;
      
      if (data) {
        const productData = castData(data, {});
        form.reset({
          title: productData.title || '',
          description: productData.description || '',
          price: productData.price || 0,
          originalPrice: productData.original_price || undefined,
          inStock: productData.in_stock ?? true,
          slug: productData.slug || '',
          externalId: productData.external_id || '',
          categoryId: productData.category_id || '',
          images: productData.images && productData.images.length > 0 ? productData.images.join('\n') : '',
          kioskToken: productData.kiosk_token || '',
          stock: productData.stock || 0,
        });
        setFormDirty(false);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: ProductFormValues) => {
    try {
      setIsLoading(true);
      
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const productData = {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          original_price: formData.originalPrice || null,
          in_stock: formData.inStock,
          slug: formData.slug,
          external_id: formData.externalId || null,
          category_id: formData.categoryId,
          images: formData.images ? formData.images.split('\n').filter(url => url.trim() !== '') : [],
          kiosk_token: formData.kioskToken || null,
          stock: formData.stock || 0,
        };

        if (productId) {
          const { error } = await supabase
            .from('products')
            .update(prepareDataForInsert(productData))
            .eq('id', prepareQueryId(productId));

          if (error) throw error;
          toast.success('Product updated successfully');
        } else {
          const { error } = await supabase
            .from('products')
            .insert(prepareDataForInsert(productData));

          if (error) throw error;
          toast.success('Product created successfully');
        }
      }

      setFormDirty(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    if (formDirty) {
      setShowResetDialog(true);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      inStock: true,
      slug: '',
      externalId: '',
      categoryId: '',
      images: '',
      kioskToken: '',
      stock: 0,
    });
    setFormDirty(false);
    toast.info('Form has been reset');
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) {
      toast.error('Please enter a title first');
      return;
    }
    
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    form.setValue('slug', slug);
    toast.success('Slug generated from title');
  };

  const handleApiTrigger = async () => {
    const kioskToken = form.getValues('kioskToken');
    
    if (!kioskToken) {
      toast.error('Please enter a kiosk token first');
      return;
    }
    
    if (onApiTest) {
      try {
        setIsLoading(true);
        const response = await onApiTest(kioskToken);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('API test error:', error);
      }
    }
  };

  const handleApiData = (data: ApiResponse) => {
    if (!data) {
      toast.error('No API data to apply');
      return;
    }

    try {
      const currentKioskToken = form.getValues('kioskToken');
      
      if (data.name) {
        form.setValue('title', data.name, { shouldValidate: true, shouldDirty: true });
      }
      
      if (data.kioskToken) {
        form.setValue('kioskToken', data.kioskToken, { shouldValidate: true, shouldDirty: true });
      } else if (currentKioskToken) {
        form.setValue('kioskToken', currentKioskToken, { shouldValidate: true, shouldDirty: true });
      }
      
      if (data.price) {
        const price = parseFloat(data.price) * 3;
        form.setValue('price', price, { shouldValidate: true, shouldDirty: true });
        
        form.setValue('originalPrice', parseFloat(data.price), { shouldValidate: true, shouldDirty: true });
      }
      
      if (data.stock) {
        const stockValue = parseInt(data.stock) || 0;
        form.setValue('stock', stockValue, { shouldValidate: true, shouldDirty: true });
        
        form.setValue('inStock', stockValue > 0, { shouldValidate: true, shouldDirty: true });
      }
      
      if (data.name && !form.getValues('slug')) {
        const slug = data.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
          
        form.setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
      }
      
      if (data.description) {
        form.setValue('description', data.description, { shouldValidate: true, shouldDirty: true });
      } else if (data.name) {
        form.setValue('description', `${data.name} - Digital Product`, { shouldValidate: true, shouldDirty: true });
      }
      
      setFormDirty(true);
      toast.success('API data applied to form successfully');
    } catch (error) {
      console.error('Error applying API data to form:', error);
      toast.error('Failed to apply API data to form');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="kioskToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
                          {...field}
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleApiTrigger}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Test API
                      </Button>
                    </div>
                    <FormDescription>
                      This token is used to identify and synchronize the product with external services.
                    </FormDescription>
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
                  <FormLabel>Product Title <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="min-h-[120px]"
                      {...field}
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
                  <FormLabel>URL Slug <span className="text-red-500">*</span></FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input 
                        placeholder="product-url-slug" 
                        {...field} 
                      />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (VND) <span className="text-red-500">*</span></FormLabel>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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
                        {categories.map((category) => (
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

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images (URLs)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter URLs, one per line"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter image URLs, one per line. First image will be used as the main product image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="External reference ID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional external reference ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetForm}
              disabled={isLoading}
              className="border-gray-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Form
            </Button>
            <div className="space-x-2">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productId ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog}
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
    </>
  );
}
