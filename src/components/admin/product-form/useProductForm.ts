import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProductSync } from '@/hooks/use-product-sync';
import { Category } from '@/types';
import { fetchProxySettings } from '@/utils/proxyUtils';
import { ApiResponse, fetchActiveApiConfig, fetchProductData } from '@/utils/apiUtils';
import { 
  isValidArray, 
  isValidRecord, 
  isSupabaseRecord, 
  safeString, 
  safeNumber,
  extractSafeData,
  safeCastData,
  processSupabaseData
} from '@/utils/supabaseHelpers';

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

export type ProductFormValues = z.infer<typeof productSchema>;

interface CategoryData {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  count: number;
  parent_id: string | null;
}

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

export function useProductForm(productId?: string, onSuccess?: () => void) {
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

      if (isValidArray(data)) {
        const typedCategories: Category[] = [];
        data.forEach(item => {
          if (isSupabaseRecord(item) && isValidRecord<CategoryData>(item)) {
            typedCategories.push({
              id: safeString(item.id),
              name: safeString(item.name),
              description: safeString(item.description),
              slug: safeString(item.slug),
              image: safeString(item.image),
              count: safeNumber(item.count),
              parent_id: item.parent_id ? safeString(item.parent_id) : null
            });
          }
        });
        setCategories(typedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

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
          title: safeString(productData.title),
          description: safeString(productData.description),
          price: safeNumber(productData.price),
          originalPrice: productData.original_price !== undefined ? safeNumber(productData.original_price) : undefined,
          inStock: !!productData.in_stock,
          slug: safeString(productData.slug),
          externalId: productData.external_id ? safeString(productData.external_id) : '',
          categoryId: safeString(productData.category_id),
          images: Array.isArray(productData.images) && productData.images.length > 0 ? productData.images.join('\n') : '',
          kioskToken: productData.kiosk_token ? safeString(productData.kiosk_token) : '',
          stock: safeNumber(productData.stock),
        });
        setFormDirty(false);
      } else {
        toast.error('No valid product found');
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
    
    console.log("API data received:", data);
    
    try {
      const currentKioskToken = form.getValues('kioskToken') || data.kioskToken;
      
      if (data.name) {
        form.setValue('title', data.name, { shouldValidate: true });
      }
      
      form.setValue('kioskToken', currentKioskToken || '', { shouldValidate: true });
      
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
      if (!isValidRecord(apiConfig)) {
        toast.error('Failed to fetch API configuration');
        return;
      }
      
      const userToken = safeString(apiConfig.user_token || '');
      
      if (!userToken) {
        toast.error('User token not configured');
        return;
      }
      
      const apiResponse = await fetchProductData(kioskToken, userToken, proxyConfig);
      
      if (apiResponse.success === "true") {
        handleApiDataReceived(apiResponse);
        toast.success('Product data fetched successfully!');
      } else {
        toast.error(`Failed to fetch product data: ${apiResponse.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error(`Error fetching product data: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    categories,
    isLoading,
    formDirty,
    showResetDialog,
    setShowResetDialog,
    resetForm,
    onSubmit,
    handleApiTest,
    handleApiDataReceived
  };
}
