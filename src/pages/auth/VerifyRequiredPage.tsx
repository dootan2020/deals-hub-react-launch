
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/layout/Layout";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyRequiredPage() {
  const { user, resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!user?.email || resending || cooldown > 0) return;
    setResending(true);
    try {
      await resendVerificationEmail(user.email);
      toast.success("Đã gửi lại email xác nhận", "Vui lòng kiểm tra hộp thư của bạn.");
      setCooldown(30); // Increase cooldown to 30 seconds to prevent abuse
    } catch (e: any) {
      const errorMsg = e?.message || "";
      
      // Handle rate limiting errors
      if (errorMsg.includes('Too Many Requests') || e?.status === 429) {
        const retryAfter = e?.retryAfter || 60;
        toast.error(
          "Yêu cầu quá nhiều",
          `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
        );
        setCooldown(retryAfter);
      } else {
        toast.error("Không thể gửi lại email xác nhận", errorMsg);
      }
    } finally {
      setResending(false);
    }
  };

  // Cooldown logic
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <Layout title="Cần xác minh email">
      <div className="container max-w-md py-12">
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Xác minh email để tiếp tục</CardTitle>
            <CardDescription>
              Hệ thống yêu cầu bạn xác minh email để sử dụng tất cả các chức năng.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Alert className="bg-amber-50 border border-amber-100">
              <AlertDescription className="text-amber-800">
                Vui lòng kiểm tra hộp thư (<b>{user?.email}</b>), tìm email xác nhận và làm theo hướng dẫn để kích hoạt tài khoản.
              </AlertDescription>
            </Alert>
            <Button 
              disabled={resending || cooldown > 0} 
              className="w-full relative" 
              variant="outline" 
              onClick={handleResend}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi lại...
                </>
              ) : cooldown > 0 ? (
                `Gửi lại sau (${cooldown}s)`
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gửi lại email xác nhận
                </>
              )}
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => navigate("/login")}>
              Đăng nhập khác
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
