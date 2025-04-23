
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ApiResponse } from '@/utils/apiUtils';
import { toast } from 'sonner';
import { Category } from '@/types';
import { safeString, safeNumber, prepareForUpdate, prepareForInsert, isSupabaseError } from '@/utils/supabaseHelpers';

interface ProductFormProps {
  productId?: string;
  onSubmit?: (data: any) => Promise<void>;
  onApiTest?: (kioskToken: string) => Promise<any>;
  onApiDataReceived?: (data: ApiResponse) => void;
  categories: Category[];
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  originalPrice: z.coerce.number().positive('Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string().min(1, 'Slug is required'),
  categoryId: z.string().min(1, 'Category is required'),
  externalId: z.string().optional(),
  kioskToken: z.string().optional(),
  stock: z.coerce.number().min(0, 'Stock must be 0 or greater'),
  images: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  in_stock: boolean;
  slug: string;
  external_id?: string;
  category_id: string;
  images?: string[];
  kiosk_token?: string;
  stock: number;
}

export function ProductForm({ productId, onSubmit, onApiTest, onApiDataReceived, categories }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      inStock: true,
      slug: '',
      categoryId: '',
      externalId: '',
      kioskToken: '',
      stock: 0,
      images: '',
    }
  });

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId.toString())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Type cast safely
        const productData = data as ProductData;
        
        form.reset({
          title: safeString(productData.title),
          description: safeString(productData.description),
          price: safeNumber(productData.price),
          originalPrice: productData.original_price ? safeNumber(productData.original_price) : undefined,
          inStock: !!productData.in_stock,
          slug: safeString(productData.slug),
          categoryId: safeString(productData.category_id),
          externalId: productData.external_id ? safeString(productData.external_id) : '',
          kioskToken: productData.kiosk_token ? safeString(productData.kiosk_token) : '',
          stock: safeNumber(productData.stock),
          images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images.join('\n') : '',
        });
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlugFromTitle = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    form.setValue('slug', slug, { shouldValidate: true });
  };

  const handleApiTestClick = async () => {
    const kioskToken = form.getValues('kioskToken');
    if (!kioskToken) {
      toast.error('Please enter a kiosk token');
      return;
    }

    if (!onApiTest) {
      toast.error('API test function not provided');
      return;
    }

    setIsTestingApi(true);
    try {
      const data = await onApiTest(kioskToken);
      if (data && onApiDataReceived) {
        onApiDataReceived(data);
      }
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      if (onSubmit) {
        // Convert form values to the format expected by the backend
        const productData = {
          title: values.title,
          description: values.description,
          price: values.price,
          original_price: values.originalPrice,
          in_stock: values.inStock,
          slug: values.slug,
          external_id: values.externalId || null,
          category_id: values.categoryId,
          images: values.images ? values.images.split('\n').filter(url => url.trim() !== '') : [],
          kiosk_token: values.kioskToken || null,
          stock: values.stock || 0,
        };
        
        await onSubmit(productData);
      } else {
        // Default handling if onSubmit not provided
        if (productId) {
          // Update existing product
          const updateData = prepareForUpdate<any>({
            title: values.title,
            description: values.description,
            price: values.price,
            original_price: values.originalPrice,
            in_stock: values.inStock,
            slug: values.slug,
            external_id: values.externalId || null,
            category_id: values.categoryId,
            images: values.images ? values.images.split('\n').filter(url => url.trim() !== '') : [],
            kiosk_token: values.kioskToken || null,
            stock: values.stock || 0,
          });
          
          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productId.toString());
          
          if (updateError) throw updateError;
          toast.success('Product updated successfully');
        } else {
          // Create new product
          const insertData = prepareForInsert<any>({
            title: values.title,
            description: values.description,
            price: values.price,
            original_price: values.originalPrice,
            in_stock: values.inStock,
            slug: values.slug,
            external_id: values.externalId || null,
            category_id: values.categoryId,
            images: values.images ? values.images.split('\n').filter(url => url.trim() !== '') : [],
            kiosk_token: values.kioskToken || null,
            stock: values.stock || 0,
          });
          
          const { error: insertError } = await supabase
            .from('products')
            .insert([insertData]);
          
          if (insertError) throw insertError;
          toast.success('Product created successfully');
          
          // Reset the form
          form.reset();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to save product: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="kioskToken"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="flex-1">
                      <FormLabel>Kiosk Token</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter kiosk token for product data" />
                      </FormControl>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleApiTestClick}
                      disabled={isTestingApi || !field.value}
                    >
                      {isTestingApi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Get Product Data
                    </Button>
                  </div>
                  <FormDescription>
                    Enter a kiosk token to retrieve product information from the API.
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
                  <FormLabel>Product Title <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter product description" className="min-h-[100px]" />
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
                    <FormLabel>Price (VND) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
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
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        placeholder="Original price (for discounts)"
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Used to show discount from original price.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="1" 
                        {...field} 
                      />
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
                    <div>
                      <FormLabel className="text-base">Available for Sale</FormLabel>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input {...field} placeholder="product-slug" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSlugFromTitle}
                      >
                        Generate
                      </Button>
                    </div>
                    <FormDescription>
                      URL-friendly identifier for the product
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
                    <FormLabel>External ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="External product ID (optional)" />
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
                  <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images (one URL per line)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter one image URL per line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {productId ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
