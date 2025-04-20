
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { Control } from 'react-hook-form';
import type { LoginFormValues } from '../types';

interface EmailFieldProps {
  control: Control<LoginFormValues>;
  isLoading: boolean;
}

export const EmailField = ({ control, isLoading }: EmailFieldProps) => {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-text-light" />
            <FormControl>
              <Input 
                id="email"
                type="email"
                placeholder="your@email.com"
                className="pl-10"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
