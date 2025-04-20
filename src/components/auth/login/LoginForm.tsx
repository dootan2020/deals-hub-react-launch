
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Lock, LogIn } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
  serverError: string | null;
  emailNeedsVerification: string | null;
  resendCooldown: number;
  onResendVerification: () => void;
}

export const LoginForm = ({
  onSubmit,
  isLoading,
  serverError,
  emailNeedsVerification,
  resendCooldown,
  onResendVerification,
}: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          
          {emailNeedsVerification && (
            <Alert className="bg-amber-50 border border-amber-100">
              <AlertDescription className="text-amber-800">
                Email của bạn chưa được xác minh. Vui lòng kiểm tra hộp thư hoặc nhấn nút bên dưới để gửi lại email xác minh.
              </AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
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
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Quên mật khẩu?
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
          
          {emailNeedsVerification && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={resendCooldown > 0 || isLoading}
              onClick={onResendVerification}
            >
              {resendCooldown > 0 ? (
                `Gửi lại email sau (${resendCooldown}s)`
              ) : (
                'Gửi lại email xác minh'
              )}
            </Button>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Đăng nhập
              </>
            )}
          </Button>

          <div className="text-sm text-center text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Đăng ký
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};
