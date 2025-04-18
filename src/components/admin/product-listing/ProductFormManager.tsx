
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Category } from '@/types';

// Define product schema
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

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  category_id?: string | null;
  created_at: string;
  slug: string;
  description: string;
  images?: string[];
  kiosk_token?: string | null;
  stock: number;
}

interface ProductFormManagerProps {
  onSubmit: (data: ProductFormValues, id?: string) => Promise<void>;
  categories: Category[];
  children: (formProps: {
    form: ReturnType<typeof useForm<ProductFormValues>>;
    isSubmitting: boolean;
    isEditMode: boolean;
    resetForm: () => void;
    handleCancel: () => void;
    handleSubmit: () => void;
  }) => React.ReactNode;
  initialProductData?: Product | null;
}

export function ProductFormManager({
  onSubmit,
  categories,
  children,
  initialProductData = null
}: ProductFormManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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

  // Update form when initialProductData changes
  useEffect(() => {
    if (initialProductData) {
      setIsEditMode(true);
      setEditingProductId(initialProductData.id);
      
      form.reset({
        title: initialProductData.title,
        description: initialProductData.description,
        price: initialProductData.price,
        originalPrice: initialProductData.original_price || undefined,
        inStock: initialProductData.in_stock,
        slug: initialProductData.slug,
        category_id: initialProductData.category_id || '',
        images: initialProductData.images ? initialProductData.images.join('\n') : '',
        kioskToken: initialProductData.kiosk_token || '',
        stock: initialProductData.stock || 0
      });
    } else {
      resetForm();
    }
  }, [initialProductData, form]);

  const resetForm = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    form.reset({
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
    });
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await form.handleSubmit(async (data) => {
        await onSubmit(data, isEditMode ? editingProductId || undefined : undefined);
        
        if (isEditMode) {
          toast.success('Product updated successfully');
        } else {
          toast.success('Product created successfully');
        }
        
        resetForm();
      })();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return children({
    form,
    isSubmitting,
    isEditMode,
    resetForm,
    handleCancel,
    handleSubmit
  });
}

export default ProductFormManager;
