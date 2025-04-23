
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ApiTester } from './ApiTester';
import { ApiResponse } from '@/utils/apiUtils';
import { extractSafeData } from '@/utils/supabaseHelpers';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  productId?: string;
  categories: { id: string, name: string }[];
  onApiDataReceived?: (data: ApiResponse) => void;
  onApiTest?: (kioskToken: string) => Promise<ApiResponse | null>;
  onSubmit: (data: any) => Promise<void>;
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  slug: string;
  external_id?: string | null;
  category_id: string;
  images?: string[];
  kiosk_token?: string | null;
  stock: number;
}

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
  kioskToken: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive number'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ 
  productId, 
  categories,
  onApiDataReceived,
  onApiTest,
  onSubmit
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
  });

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const result = await supabase
        .from('products')
        .select('*')
        .eq('id', productId as any)
        .maybeSingle();
      
      const productData = extractSafeData<ProductData>(result);
      
      if (productData) {
        form.reset({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.original_price || undefined,
          inStock: productData.in_stock,
          slug: productData.slug,
          externalId: productData.external_id || '',
          categoryId: productData.category_id,
          images: Array.isArray(productData.images) && productData.images.length > 0 
            ? productData.images.join('\n') 
            : '',
          kioskToken: productData.kiosk_token || '',
          stock: productData.stock || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiDataReceived = (data: ApiResponse) => {
    if (!data) return;
    
    try {
      if (data.name) {
        form.setValue('title', data.name);
      }
      
      if (data.kioskToken) {
        form.setValue('kioskToken', data.kioskToken);
      }
      
      if (data.price) {
        const originalPrice = parseFloat(data.price) || 0;
        form.setValue('price', originalPrice * 2.5); // Markup price
        form.setValue('originalPrice', originalPrice);
      }
      
      if (data.stock) {
        const stockValue = parseInt(data.stock) || 0;
        form.setValue('stock', stockValue);
        form.setValue('inStock', stockValue > 0);
      }
      
      if (data.name && !form.getValues('slug')) {
        const slug = data.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        
        form.setValue('slug', slug);
      }
      
      if (data.description) {
        form.setValue('description', data.description);
      } else if (data.name) {
        form.setValue('description', `${data.name} - Digital Product`);
      }
      
      if (onApiDataReceived) {
        onApiDataReceived(data);
      }
      
      toast.success('Product data applied successfully');
    } catch (error) {
      console.error('Error applying API data:', error);
      toast.error('Failed to apply API data to form');
    }
  };

  const handleTestApi = async (kioskToken: string) => {
    if (!onApiTest) return;
    
    setIsLoading(true);
    try {
      const apiData = await onApiTest(kioskToken);
      if (apiData) {
        handleApiDataReceived(apiData);
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error('Error fetching API data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) return;
    
    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    form.setValue('slug', slug, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ApiTester 
            initialKioskToken={form.getValues('kioskToken')}
            onApiDataReceived={handleApiDataReceived}
          />
        </CardContent>
      </Card>
      
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Product Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Product title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Product description"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (VND)</Label>
                  <Input 
                    id="price"
                    type="number" 
                    {...form.register('price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                  <Input 
                    id="originalPrice"
                    type="number" 
                    {...form.register('originalPrice', { valueAsNumber: true })}
                    placeholder="Original price (for discounts)"
                  />
                  {form.formState.errors.originalPrice && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.originalPrice.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="product-url-slug"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={generateSlug}
                    >
                      Generate
                    </Button>
                  </div>
                  {form.formState.errors.slug && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.slug.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select 
                    value={form.getValues('categoryId')} 
                    onValueChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input 
                    id="stock"
                    type="number" 
                    {...form.register('stock', { valueAsNumber: true })}
                  />
                  {form.formState.errors.stock && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.stock.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="kioskToken">Kiosk Token</Label>
                  <Input 
                    id="kioskToken"
                    {...form.register('kioskToken')}
                    placeholder="API Kiosk Token"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="externalId">External ID (Optional)</Label>
                <Input 
                  id="externalId"
                  {...form.register('externalId')}
                  placeholder="External product identifier"
                />
              </div>
              
              <div>
                <Label htmlFor="images">Images (One URL per line)</Label>
                <Textarea 
                  id="images"
                  {...form.register('images')}
                  placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="inStock" 
                  checked={form.getValues('inStock')} 
                  onCheckedChange={(checked) => form.setValue('inStock', checked, { shouldValidate: true })}
                />
                <Label htmlFor="inStock">Product is in stock</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {productId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              productId ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
