
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProductFormFields } from '../product-form/ProductFormFields';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Category } from '@/types';
import { prepareQueryId, castData, castArrayData, prepareDataForInsert } from '@/utils/supabaseHelpers';

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

interface EditProductModalProps {
  isOpen: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ 
  isOpen, 
  productId, 
  onClose, 
  onSuccess 
}: EditProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  
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
    if (isOpen && productId) {
      fetchProductDetails();
      fetchCategories();
    }
  }, [isOpen, productId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(castArrayData<Category>(data));
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
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: ProductFormValues) => {
    setIsSubmitting(true);
    try {
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
      
      const { error } = await supabase
        .from('products')
        .update(prepareDataForInsert(productData))
        .eq('id', prepareQueryId(productId));
        
      if (error) throw error;
      
      toast.success('Product updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to the product information below.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading product data...</span>
          </div>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
              <ProductFormFields 
                categories={categories} 
                isEditMode={true}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
