
import { FormProvider } from 'react-hook-form';
import { ProductBasicInfoFields } from '../product-form/ProductBasicInfoFields';
import { ProductPricingFields } from '../product-form/ProductPricingFields';
import { ProductApiFields } from '../product-form/ProductApiFields';
import { ProductStockFields } from '../product-form/ProductStockFields';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          <ProductApiFields />
          <ProductBasicInfoFields />
          <ProductPricingFields />
          <ProductStockFields />

          <FormField
            name="categoryId"
            control={form.control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
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
