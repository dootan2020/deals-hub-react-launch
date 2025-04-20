
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { EmailField } from './fields/EmailField';
import { PasswordField } from './fields/PasswordField';
import { SubmitButton } from './fields/SubmitButton';
import { Button } from '@/components/ui/button';

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
          
          <EmailField control={form.control} isLoading={isLoading} />
          <PasswordField control={form.control} isLoading={isLoading} />
          
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

          <SubmitButton isLoading={isLoading} />

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
