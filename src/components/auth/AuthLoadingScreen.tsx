
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, XCircle, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface AuthLoadingScreenProps {
  onRetry?: () => void;
  onCancel?: () => void;
  message?: string;
  attempts?: number;
  isWaitingTooLong?: boolean;
}

const AuthLoadingScreen = ({ 
  onRetry, 
  onCancel, 
  message, 
  attempts = 0,
  isWaitingTooLong = false
}: AuthLoadingScreenProps) => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  
  // Track elapsed time for better user feedback
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Auto retry if waiting too long
  useEffect(() => {
    // After 8 seconds with no success, try automatic retry
    if (elapsedTime >= 8 && onRetry && !isAutoRetrying && attempts < 2) {
      setIsAutoRetrying(true);
      const timeoutId = setTimeout(() => {
        console.log('Auto-retrying authentication after timeout');
        onRetry();
        setIsAutoRetrying(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [elapsedTime, onRetry, isAutoRetrying, attempts]);

  const goHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {message || "Đang xác minh phiên đăng nhập"}
          </h2>
          <p className="text-muted-foreground mb-2">
            {isWaitingTooLong 
              ? "Quá trình này đang mất nhiều thời gian hơn dự kiến..." 
              : "Vui lòng đợi trong khi chúng tôi xác thực tài khoản..."}
          </p>
          
          {elapsedTime > 3 && (
            <p className="text-sm text-muted-foreground">
              Đã chờ {elapsedTime} giây...
              {isAutoRetrying && " (Đang tự động thử lại)"}
            </p>
          )}

          {attempts > 0 && (
            <Alert variant="warning" className="mb-4 mt-4">
              <AlertTitle>Kết nối đang gặp vấn đề</AlertTitle>
              <AlertDescription>
                Đã thử {attempts}/3 lần. {attempts >= 3 ? 'Vui lòng thử lại thủ công.' : 'Đang cố gắng kết nối...'}
              </AlertDescription>
            </Alert>
          )}
          
          {isWaitingTooLong && (
            <Alert variant="default" className="mb-4 mt-4">
              <AlertTitle>Đừng lo lắng</AlertTitle>
              <AlertDescription>
                Nếu bạn đã đăng nhập trước đó, hệ thống đang cố gắng khôi phục phiên làm việc của bạn.
                {elapsedTime > 8 && " Bạn có thể thử tải lại trang hoặc quay về trang chủ."}
              </AlertDescription>
            </Alert>
          )}
          
          {elapsedTime > 15 && (
            <Alert variant="destructive" className="mb-4 mt-4">
              <AlertTitle>Xác thực đã quá thời gian</AlertTitle>
              <AlertDescription>
                Hệ thống có thể đang quá tải hoặc kết nối của bạn không ổn định.
                Bạn có thể thử tải lại trang hoặc quay lại sau.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-center space-x-4 pt-2">
          {onRetry && elapsedTime > 5 && (
            <Button 
              variant="outline"
              onClick={onRetry}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
          
          {elapsedTime > 5 && (
            <Button 
              variant="outline"
              onClick={goHome}
              className="flex items-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          )}
          
          {onCancel && (
            <Button 
              variant="ghost"
              onClick={onCancel}
              className="flex items-center text-muted-foreground"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
