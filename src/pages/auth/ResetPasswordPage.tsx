
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      // Check if we have a session (user accessing page after clicking reset link)
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        setError('Không thể xác thực phiên đặt lại mật khẩu');
        return;
      }
      
      if (!data.session) {
        setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        return;
      }
      
      setValidToken(true);
    };
    
    checkSession();
  }, []);

  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) throw error;
      
      setSuccess(true);
      toast.success(
        "Đặt lại mật khẩu thành công", 
        "Bạn có thể đăng nhập với mật khẩu mới"
      );
      
      // After successful password reset, redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Nhập mật khẩu mới của bạn
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      Mật khẩu của bạn đã được đặt lại thành công. 
                      Bạn sẽ được chuyển hướng đến trang đăng nhập...
                    </AlertDescription>
                  </Alert>
                ) : validToken ? (
                  <>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="password">Mật khẩu mới</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                id="confirmPassword" 
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
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Đang kiểm tra tính hợp lệ của liên kết đặt lại mật khẩu...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              
              <CardFooter>
                {!success && validToken && (
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </Button>
                )}
                
                {(!validToken && !error) && (
                  <Button disabled className="w-full">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </Button>
                )}
                
                {error && (
                  <Button 
                    onClick={() => navigate('/forgot-password')}
                    className="w-full"
                  >
                    Yêu cầu liên kết mới
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
