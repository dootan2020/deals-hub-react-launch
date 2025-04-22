
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { KeyRound, Barcode } from 'lucide-react';

export function ProductApiFields() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        name="kioskToken"
        control={form.control}
        rules={{ required: "Kiosk Token is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...field} 
                  className="pl-8"
                  placeholder="e.g. DUP32BXSLWAP4847J84B" 
                />
              </div>
            </FormControl>
            <FormDescription>
              Token for API synchronization
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="externalId"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>External ID</FormLabel>
            <FormControl>
              <div className="relative">
                <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  {...field} 
                  className="pl-8"
                  placeholder="External product ID" 
                />
              </div>
            </FormControl>
            <FormDescription>
              Optional external system identifier
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
