
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import type { LoginFormValues } from './types';

interface LoginCardProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
  serverError: string | null;
  emailNeedsVerification: string | null;
  resendCooldown: number;
  onResendVerification: () => void;
}

export const LoginCard = ({
  onSubmit,
  isLoading,
  serverError,
  emailNeedsVerification,
  resendCooldown,
  onResendVerification,
}: LoginCardProps) => {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
        <CardDescription>
          Nhập thông tin đăng nhập của bạn để tiếp tục
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm
          onSubmit={onSubmit}
          isLoading={isLoading}
          serverError={serverError}
          emailNeedsVerification={emailNeedsVerification}
          resendCooldown={resendCooldown}
          onResendVerification={onResendVerification}
        />
      </CardContent>
    </Card>
  );
};
