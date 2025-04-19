
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Loader2, User, Lock, Mail } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { RegisterFormValues } from '@/validations/registerSchema';

interface RegistrationFormProps {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  isLoading: boolean;
  serverError: string | null;
}

export const RegistrationForm = ({
  form,
  onSubmit,
  isLoading,
  serverError
}: RegistrationFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    id="displayName"
                    placeholder="Nhập tên hiển thị"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-primary underline">
                    Điều khoản dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-primary underline">
                    Chính sách Bảo mật
                  </Link>
                </Label>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-dark"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Tạo tài khoản
            </>
          )}
        </Button>
        
        <div className="text-sm text-center text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Đăng nhập
          </Link>
        </div>
      </form>
    </Form>
  );
};
