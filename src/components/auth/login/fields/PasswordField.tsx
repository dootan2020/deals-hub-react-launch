
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Control } from 'react-hook-form';
import type { LoginFormValues } from '../types';

interface PasswordFieldProps {
  control: Control<LoginFormValues>;
  isLoading: boolean;
}

export const PasswordField = ({ control, isLoading }: PasswordFieldProps) => {
  return (
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-text-light" />
            <FormControl>
              <Input 
                id="password"
                type="password"
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
