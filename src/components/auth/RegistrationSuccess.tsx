
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2 } from 'lucide-react';

interface RegistrationSuccessProps {
  onResendEmail: () => Promise<void>;
  resendCooldown: number;
  isLoading: boolean;
  onNavigateToLogin: () => void;
}

export const RegistrationSuccess = ({
  onResendEmail,
  resendCooldown,
  isLoading,
  onNavigateToLogin
}: RegistrationSuccessProps) => {
  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border border-green-100">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800 ml-2">
          Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.
        </AlertDescription>
      </Alert>
      
      <div className="text-center mt-6 space-y-4">
        <Button 
          className="w-full"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendEmail}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : resendCooldown > 0 ? (
            `Gửi lại email sau (${resendCooldown}s)`
          ) : (
            'Gửi lại email xác nhận'
          )}
        </Button>
        
        <Button 
          className="w-full"
          onClick={onNavigateToLogin}
        >
          Đi đến trang đăng nhập
        </Button>
      </div>
    </div>
  );
};
