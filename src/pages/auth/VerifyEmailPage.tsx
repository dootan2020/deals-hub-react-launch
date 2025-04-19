
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuthActions } from '@/hooks/use-auth-actions';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { resendVerificationEmail } = useAuthActions();
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for error parameters from redirect
        const errorDescription = searchParams.get('error_description');
        if (errorDescription) {
          setErrorMessage(errorDescription);
          setStatus('error');
          return;
        }
        
        // Extract email from URL or session
        const sessionEmail = searchParams.get('email');
        if (sessionEmail) {
          setEmail(sessionEmail);
        } else {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.email) {
            setEmail(data.session.user.email);
          }
        }
        
        // If we have a token or code in the URL, the user is being redirected after clicking the verification link
        const token = searchParams.get('token') || searchParams.get('code');
        if (token) {
          // The verification happens automatically by Supabase
          setStatus('success');
          
          // After a delay, redirect to dashboard or login
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          // If no token, user might have navigated here directly
          const type = searchParams.get('type');
          if (type === 'recovery') {
            navigate('/reset-password');
          } else {
            setStatus('error');
            setErrorMessage('Không tìm thấy liên kết xác minh. Vui lòng kiểm tra email của bạn hoặc yêu cầu gửi lại.');
          }
        }
      } catch (error: any) {
        console.error('Error during verification:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Đã xảy ra lỗi khi xác minh email');
      }
    };
    
    verifyEmail();
  }, [searchParams, navigate]);
  
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return;
    
    try {
      await resendVerificationEmail(email);
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Xác minh Email</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Đang xác minh email của bạn...'}
              {status === 'success' && 'Email đã được xác minh thành công!'}
              {status === 'error' && 'Xác minh không thành công'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-center text-gray-600">
                  Đang xử lý yêu cầu xác minh email của bạn...
                </p>
              </div>
            )}
            
            {status === 'success' && (
              <Alert className="bg-green-50 border border-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">
                  Email của bạn đã được xác minh thành công! Bạn sẽ được chuyển hướng đến trang tổng quan trong giây lát.
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  {errorMessage || 'Đã xảy ra lỗi khi xác minh email của bạn. Vui lòng thử lại sau.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            {status === 'error' && email && (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? (
                  `Gửi lại trong (${resendCooldown}s)`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Gửi lại email xác minh
                  </>
                )}
              </Button>
            )}
            
            <Button
              className="w-full"
              onClick={() => navigate('/login')}
              variant={status === 'success' ? 'outline' : 'default'}
            >
              Đi đến trang đăng nhập
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
