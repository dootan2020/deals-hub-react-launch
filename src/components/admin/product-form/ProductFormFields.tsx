
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductBasicInfoFields } from './ProductBasicInfoFields';
import { ProductPricingFields } from './ProductPricingFields';
import { ProductStockFields } from './ProductStockFields';
import { ProductApiFields } from './ProductApiFields';
import { ImageUploader } from './ImageUploader';
import type { Category } from '@/types';

interface ProductFormFieldsProps {
  categories: Category[];
  isEditMode: boolean;
}

export function ProductFormFields({ categories, isEditMode }: ProductFormFieldsProps) {
  const form = useFormContext();

  return (
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

      <ImageUploader 
        existingImages={
          form.getValues('images') 
            ? (typeof form.getValues('images') === 'string' 
                ? form.getValues('images').split('\n').filter(Boolean)
                : [])
            : []
        } 
      />
    </div>
  );
}
