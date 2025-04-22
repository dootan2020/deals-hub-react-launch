
import { useFormContext } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, 
  FormMessage, FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function ProductPricingFields() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name="price"
          control={form.control}
          rules={{ 
            required: "Price is required",
            min: { value: 0, message: "Price must be 0 or higher" }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (VND) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="0" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          name="originalPrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  step="1"
                  placeholder="Original price (for discounts)" 
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : undefined;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Leave empty if no discount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Input 
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Available quantity"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    field.onChange(value);
                    form.setValue('inStock', value > 0);
                  }}
                />
              </FormControl>
              <FormDescription>
                Available quantity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="inStock"
        control={form.control}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">In Stock</FormLabel>
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
