
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Package } from 'lucide-react';

export function ProductStockFields() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        name="stock"
        control={form.control}
        rules={{ 
          required: "Stock is required",
          min: { value: 0, message: "Stock must be 0 or higher" }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Available quantity"
                  className="pl-8"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    field.onChange(value);
                    // Update inStock based on stock value
                    form.setValue('inStock', value > 0);
                  }}
                />
              </div>
            </FormControl>
            <FormDescription>
              Available quantity
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="inStock"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Product Availability</FormLabel>
              <FormDescription>
                Is this product available for purchase?
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
