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
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

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
  kioskToken: z.string().min(1, 'Kiosk Token is required'),
  stock: z.number().int().min(0, 'Stock must be a positive number'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
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
      stock: 0,
    }
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
          stock: data.stock || 0,
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

  const updateFormWithApiData = (data: ApiResponse, formData: any) => {
    if (!data) return formData;
    
    const updatedData = { ...formData };
    
    updatedData.title = data.name || formData.title;
    updatedData.description = data.description || `${data.name} - Digital Product` || '';
    updatedData.price = parseFloat(data.price) || formData.price;
    updatedData.inStock = parseInt(data.stock || '0') > 0;
    
    // Map API stock to form
    updatedData.stock = parseInt(data.stock || '0');
    updatedData.inStock = parseInt(data.stock || '0') > 0;
    
    return updatedData;
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
        stock: formData.stock || 0,
      };

      if (productId) {
        await updateProduct({ id: productId, ...productData });
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }

      setFormDirty(false);
      
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
      price: '',
      originalPrice: '',
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

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <KioskTokenField />
          <BasicProductInfo categories={categories} />

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
            <FormFooter isLoading={isLoading} productId={productId} />
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
