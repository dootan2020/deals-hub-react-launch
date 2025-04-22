
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EditProductHeader } from './EditProductHeader';
import { EditProductFormFields } from './EditProductFormFields';
import { useEditProduct } from '@/hooks/admin/useEditProduct';
import type { Category } from '@/types';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const { form, isLoading, isSubmitting, fetchProductDetails, handleSubmit } = useEditProduct(productId, onSuccess);
  
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
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <EditProductHeader />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading product data...</span>
          </div>
        ) : (
          <EditProductFormFields
            form={form}
            categories={categories}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
