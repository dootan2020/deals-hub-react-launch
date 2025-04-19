
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Mail, Loader2, X } from 'lucide-react';

export default function VerifyEmailBanner() {
  const { user } = useAuth();
  const { resendVerificationEmail } = useAuthActions();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Don't show banner if user is null or user.email_confirmed_at exists
  const emailConfirmed = user?.email_confirmed_at;
  const shouldShow = user && !emailConfirmed && isVisible;
  
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!shouldShow) return null;

  const handleResend = async () => {
    if (!user?.email || cooldown > 0) return;
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(user.email);
      setCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Alert className="bg-amber-50 border border-amber-100 mb-4">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-amber-600 mr-2" />
          <AlertDescription className="text-amber-800">
            Vui lòng xác minh địa chỉ email của bạn để kích hoạt tài khoản.
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || isLoading}
            className="h-8 text-xs bg-transparent border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : cooldown > 0 ? (
              `${cooldown}s`
            ) : (
              'Gửi lại'
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-amber-600 hover:bg-amber-100"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
