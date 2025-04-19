
import { useLogin } from './use-login';
import { useRegister } from './use-register';
import { useVerification } from './use-verification';
import { usePasswordReset } from './use-password-reset';

export const useAuthActions = () => {
  const { login } = useLogin();
  const { register } = useRegister();
  const { resendVerificationEmail } = useVerification();
  const { resetPassword } = usePasswordReset();
  
  return {
    login,
    register,
    resendVerificationEmail,
    resetPassword,
  };
};

export type { } from '@supabase/supabase-js';
