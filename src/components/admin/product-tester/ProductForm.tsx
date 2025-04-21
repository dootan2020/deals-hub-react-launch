
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useProductSync } from '@/hooks/use-product-sync';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

export type ProductFormValues = z.infer<typeof productSchema>;

export const ProductFormComponent = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [loading, setLoading] = useState(false);
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

  const onSubmit = async (values: ProductFormValues) => {
    console.log("Form values", values);
    try {
      // Create a product object with all required fields
      const productData = {
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
        shortDescription: values.description.substring(0, 100)
      };
      
      await syncProduct(productData as any);
      toast.success('Product created successfully!');
      navigate('/admin/product-manager');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(`Error creating product: ${error.message}`);
    }
  };

  return (
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
  );
};

export default ProductFormComponent;
