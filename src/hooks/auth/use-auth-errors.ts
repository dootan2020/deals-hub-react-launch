
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AuthError } from '@/types';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

export const useAuthErrors = () => {
  const [lastError, setLastError] = useState<AuthError | null>(null);

  const handleAuthError = useCallback((error: AuthError) => {
    setLastError(error);

    let title = 'Lỗi xác thực';
    let description = error.message;

    // Handle specific error cases
    if (error.message?.includes('rate limit')) {
      title = 'Quá nhiều yêu cầu';
      description = 'Vui lòng đợi một lúc trước khi thử lại';
    } else if (error.message?.includes('Invalid refresh token')) {
      title = 'Phiên đã hết hạn';
      description = 'Vui lòng đăng nhập lại';
    }

    toast.error(title, {
      description,
      duration: 5000
    });

    authMonitoring.logEvent({
      type: 'auth_error',
      metadata: { error: error.message, code: error.code }
    });

    return { title, description };
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    lastError,
    handleAuthError,
    clearError
  };
};
