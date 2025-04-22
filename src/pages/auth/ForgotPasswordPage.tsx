
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuthActions();
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Khôi phục mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
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
                      Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. 
                      Vui lòng kiểm tra hòm thư (kể cả thư rác).
                    </AlertDescription>
                  </Alert>
                ) : (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                {success ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại trang đăng nhập
                  </Button>
                ) : (
                  <>
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
                        'Gửi liên kết đặt lại mật khẩu'
                      )}
                    </Button>
                    
                    <div className="text-center text-sm">
                      <Link to="/login" className="text-primary hover:underline">
                        Quay lại đăng nhập
                      </Link>
                    </div>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
