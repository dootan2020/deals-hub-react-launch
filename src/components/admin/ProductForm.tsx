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
import { ProductFormFields } from './product-form/ProductFormFields';
import { FormFooter } from './product-form/FormFooter';
import { ApiProductTester, ApiResponse } from '@/components/admin/product-manager/ApiProductTester';
import { fetchProxySettings } from '@/utils/proxyUtils';
import { fetchViaProxy } from '@/utils/proxyUtils';
import { fetchActiveApiConfig } from '@/utils/apiUtils';
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
import { sanitizeHtml } from '@/utils/sanitizeHtml';
import { castArrayData, prepareQueryId, castData } from '@/utils/supabaseHelpers';

const productSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters.')
    .transform((v) => sanitizeHtml(v)),
  description: z.string()
    .min(10, 'Description must be at least 10 characters.')
    .transform((v) => sanitizeHtml(v)),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  originalPrice: z.coerce.number().min(0, 'Original price must be positive').optional(),
  inStock: z.boolean().default(true),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters.')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.')
    .transform((v) => sanitizeHtml(v)),
  externalId: z.string().optional().transform((v) => v ? sanitizeHtml(v) : v),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.string().optional().transform((v) => v ? sanitizeHtml(v) : v),
  kioskToken: z.string()
    .min(1, 'Kiosk Token is required')
    .transform((v) => sanitizeHtml(v)),
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
        const defaultProductData = {
          title: '',
          description: '',
          price: 0,
          original_price: undefined,
          in_stock: true,
          slug: '',
          external_id: '',
          category_id: '',
          images: [],
          kiosk_token: '',
          stock: 0,
        };
        
        const productData = { ...defaultProductData, ...castData(data, {}) };
        
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

  const updateFormWithApiData = (data: ApiResponse, formData: any) => {
    if (!data) return formData;
    
    const updatedData = { ...formData };
    
    updatedData.title = data.name || formData.title;
    updatedData.description = data.description || `${data.name} - Digital Product` || formData.description;
    updatedData.price = parseFloat(data.price) || formData.price;
    updatedData.stock = parseInt(data.stock || '0', 10);
    updatedData.inStock = parseInt(data.stock || '0', 10) > 0;
    
    return updatedData;
  };

  const onSubmit = async (formData: ProductFormValues) => {
    setIsLoading(true);
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

      if (productId) {
        updateProduct({ id: productId, ...productData } as any);
        toast.success('Product updated successfully');
      } else {
        createProduct(productData as any);
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

  const handleApiTest = async (kioskToken: string) => {
    if (!kioskToken) {
      toast.error('Please enter a kiosk token');
      return;
    }

    try {
      setIsLoading(true);
      toast.info('Fetching product data...');

      const proxyConfig = await fetchProxySettings();
      
      const apiConfig = await fetchActiveApiConfig();
      const apiConfigData = apiConfig as any;
      const userToken = apiConfigData.user_token;
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${userToken}`;
      const data = await fetchViaProxy(apiUrl, proxyConfig);
      
      if (data?.success === "true") {
        form.setValue('title', data.name);
        form.setValue('description', `${data.name}\n\n${data.description || ''}`.trim());
        form.setValue('price', parseFloat(data.price) * 3);
        form.setValue('stock', parseInt(data.stock || '0', 10));
        form.setValue('inStock', parseInt(data.stock || '0', 10) > 0);
        
        const slug = data.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        form.setValue('slug', slug);
        
        toast.success('Product data fetched successfully!');
      } else {
        toast.error(`Failed to fetch product data: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error(`Error fetching product data: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiDataReceived = (data: ApiResponse) => {
    if (!data) return;
    
    console.log("API data received:", data);
    
    try {
      const currentKioskToken = form.getValues('kioskToken') || data.kioskToken;
      
      if (data.name) {
        form.setValue('title', data.name, { shouldValidate: true });
      }
      
      form.setValue('kioskToken', currentKioskToken, { shouldValidate: true });
      
      if (data.price) {
        const originalPrice = parseFloat(data.price) || 0;
        form.setValue('price', originalPrice * 3, { shouldValidate: true });
        form.setValue('originalPrice', originalPrice, { shouldValidate: true });
      }
      
      if (data.stock) {
        const stockValue = parseInt(data.stock) || 0;
        form.setValue('stock', stockValue, { shouldValidate: true });
        form.setValue('inStock', stockValue > 0, { shouldValidate: true });
      }
      
      if (data.name && !form.getValues('slug')) {
        const slug = data.name.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        
        form.setValue('slug', slug, { shouldValidate: true });
      }
      
      if (data.description) {
        form.setValue('description', data.description, { shouldValidate: true });
      } else if (data.name) {
        form.setValue('description', `${data.name} - Digital Product`, { shouldValidate: true });
      }
      
      toast.success('Product data applied successfully');
    } catch (error) {
      console.error('Error applying API data:', error);
      toast.error('Failed to apply API data to form');
    }
  };

  return (
    <>
      <ApiProductTester 
        onApiDataReceived={handleApiDataReceived} 
        initialKioskToken={form.getValues('kioskToken')}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ProductFormFields 
            categories={categories} 
            isEditMode={!!productId}
          />

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
