import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Loader2, UserPlus, User, Lock, Mail, FileCheck, CheckCircle } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthActions } from '@/hooks/use-auth-actions';

// Enhanced password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const registerSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải c�� ít nhất 8 ký tự')
    .regex(
      passwordRegex,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmPassword: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách Bảo mật"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { register, isAuthenticated, loading } = useAuth();
  const { resendVerificationEmail } = useAuthActions();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, loading]);
  
  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setIsLoading(true);
    
    try {
      const result = await register(values.email, values.password, {
        display_name: values.displayName
      });
      
      // Show success message and reset form
      setRegistrationSuccess(true);
      setRegisteredEmail(values.email);
      form.reset();
    } catch (error: any) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !registeredEmail) return;
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(registeredEmail);
      setResendCooldown(60); // Set 60 second cooldown
    } catch (error) {
      console.error('Resend verification email error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Tạo tài khoản">
      <div className="container max-w-md py-12">
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo tài khoản mới
            </CardDescription>
          </CardHeader>
          
          {registrationSuccess ? (
            <CardContent className="space-y-4">
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
                  onClick={handleResendEmail}
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
                  onClick={() => navigate('/login')}
                >
                  Đi đến trang đăng nhập
                </Button>
              </div>
            </CardContent>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <CardContent className="space-y-4">
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
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
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
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </Layout>
  );
}
