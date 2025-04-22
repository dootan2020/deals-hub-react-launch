
import { Button } from '@/components/ui/button';
import { ProductFormFields } from '../product-form/ProductFormFields';
import { FormProvider } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { Category } from '@/types';
import type { ProductFormValues } from '@/hooks/admin/useEditProduct';

interface EditProductFormFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
}

export function EditProductFormFields({
  form,
  categories,
  isSubmitting,
  onSubmit,
  onCancel
}: EditProductFormFieldsProps) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <ProductFormFields 
          categories={categories} 
          isEditMode={true}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
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
  );
}
