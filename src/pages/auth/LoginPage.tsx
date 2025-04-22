
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, User, Lock, LogIn } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { toast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const { resendVerificationEmail } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailNeedsVerification, setEmailNeedsVerification] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Get the redirect URL from the state or default to home
  const from = location.state?.from?.pathname || '/';
  
  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);
    setEmailNeedsVerification(null);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Đang đăng nhập...");
      
      await login(values.email, values.password);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      // Toast will be shown in login function if successful
      
      // Navigation will be triggered by the useEffect when isAuthenticated changes
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.message?.includes('Email not confirmed')) {
        setEmailNeedsVerification(values.email);
      } else {
        setServerError(err.message || 'Đăng nhập thất bại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNeedsVerification || resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading("Đang gửi email xác minh...");
      
      await resendVerificationEmail(emailNeedsVerification);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If already authenticated, don't render the login form (prevents flash)
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)}>
              <CardContent className="space-y-4">
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
                    onClick={handleResendVerification}
                  >
                    {resendCooldown > 0 ? (
                      `Gửi lại email sau (${resendCooldown}s)`
                    ) : (
                      'Gửi lại email xác minh'
                    )}
                  </Button>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
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
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
