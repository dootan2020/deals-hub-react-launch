
import { useFormContext } from 'react-hook-form';
import { 
  FormField, FormItem, FormLabel, FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { KioskTokenField } from './KioskTokenField';

export function ProductApiFields() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <KioskTokenField />

      <FormField
        name="externalId"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>External ID (optional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="External product ID" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
