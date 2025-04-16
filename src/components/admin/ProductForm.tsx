
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductSync } from '@/hooks/use-product-sync';
import { Form } from '@/components/ui/form';
import { Category } from '@/types';
import { KioskTokenField } from './product-form/KioskTokenField';
import { BasicProductInfo } from './product-form/BasicProductInfo';
import { FormFooter } from './product-form/FormFooter';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <KioskTokenField />
        <BasicProductInfo categories={categories} />
        <FormFooter isLoading={isLoading} productId={productId} />
      </form>
    </Form>
  );
}
