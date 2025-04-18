
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Category } from '@/types';
import { toast } from 'sonner';

export interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
}

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

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormSectionProps {
  categories: Category[];
  onSubmit: (data: ProductFormValues) => void;
  apiResponse: ApiResponse | null;
  isSubmitting: boolean;
  isEditMode: boolean;
  onRequestResetConfirm: () => void;
  onKioskTokenChange: (token: string) => void;
}

export function ProductFormSection({ 
  categories, 
  onSubmit, 
  apiResponse, 
  isSubmitting, 
  isEditMode,
  onRequestResetConfirm,
  onKioskTokenChange
}: ProductFormSectionProps) {
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

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const applyApiDataToForm = () => {
    if (!apiResponse) return;
    
    const updatedFormData = {
      title: apiResponse.name || form.getValues('title'),
      description: apiResponse.description || `${apiResponse.name} - Digital Product` || form.getValues('description'),
      price: parseFloat(apiResponse.price) || form.getValues('price'),
      inStock: parseInt(apiResponse.stock || '0') > 0,
      stock: parseInt(apiResponse.stock || '0')
    };
    
    form.setValue('title', updatedFormData.title);
    form.setValue('description', updatedFormData.description);
    form.setValue('price', updatedFormData.price);
    form.setValue('inStock', updatedFormData.inStock);
    form.setValue('stock', updatedFormData.stock);
    
    if (!form.getValues('slug')) {
      form.setValue('slug', generateSlug(updatedFormData.title));
    }
    
    toast.success("API data applied to form");
  };

  // Apply API data when it changes
  if (apiResponse) {
    applyApiDataToForm();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kioskToken"
              rules={{ required: "Kiosk Token is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Kiosk Token" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onKioskTokenChange(e.target.value);
                      }}
                    />
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onRequestResetConfirm}
                className="border-gray-300 text-gray-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  isEditMode ? 'Updating...' : 'Saving...'
                ) : (
                  isEditMode ? 'Update Product' : 'Save Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
