
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractSafeData } from '@/utils/supabaseHelpers';

// Product form schema
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  originalPrice: z.coerce.number().min(0, 'Original price must be positive').optional().nullable(),
  inStock: z.boolean().default(true),
  slug: z.string().min(3, 'Slug must be at least 3 characters.')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  externalId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  kioskToken: z.string().optional(),
  stock: z.coerce.number().int().min(0, 'Stock must be a positive number'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  in_stock: boolean;
  slug: string;
  external_id: string | null;
  category_id: string;
  images: string[];
  kiosk_token: string | null;
  stock: number;
}

export function useEditProduct(productId: string, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      originalPrice: null,
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
          originalPrice: productData.original_price,
          inStock: productData.in_stock,
          slug: productData.slug,
          externalId: productData.external_id || '',
          categoryId: productData.category_id,
          images: Array.isArray(productData.images) && productData.images.length > 0 
            ? productData.images.join('\n') 
            : '',
          kioskToken: productData.kiosk_token || '',
          stock: productData.stock,
        });
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (data: ProductFormValues) => {
    if (!productId) return;
    
    setIsSubmitting(true);
    try {
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice || null,
        in_stock: data.inStock,
        slug: data.slug,
        external_id: data.externalId || null,
        category_id: data.categoryId,
        images: data.images ? data.images.split('\n').filter(url => url.trim() !== '') : [],
        kiosk_token: data.kioskToken || null,
        stock: data.stock,
      };
      
      const { error } = await supabase
        .from('products')
        .update(productData as any)
        .eq('id', productId as any);
        
      if (error) throw error;
      
      toast.success('Product updated successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isLoading,
    isSubmitting,
    fetchProductDetails,
    handleSubmit
  };
}
