
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface AuthLoadingScreenProps {
  onRetry?: () => void;
  onCancel?: () => void;
}

const AuthLoadingScreen = ({ onRetry, onCancel }: AuthLoadingScreenProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const MAX_WAIT_TIME = 5; // 5 seconds
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 0.1;
        if (newTime >= MAX_WAIT_TIME && !showTimeout) {
          setShowTimeout(true);
        }
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, []);
  
  const progressValue = Math.min((timeElapsed / MAX_WAIT_TIME) * 100, 100);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      {!showTimeout ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Đang xác thực...</h2>
          <p className="text-muted-foreground mb-4 text-center">
            Đang kiểm tra thông tin đăng nhập của bạn
          </p>
          <Progress value={progressValue} className="w-64 mb-4" />
          <p className="text-sm text-muted-foreground">
            {Math.round(timeElapsed * 10) / 10}s / {MAX_WAIT_TIME}s
          </p>
        </>
      ) : (
        <>
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Xác thực đang mất nhiều thời gian</h2>
          
          <Alert className="max-w-md mb-4 bg-amber-50 border-amber-200">
            <AlertDescription>
              Quá trình xác thực đang mất nhiều thời gian hơn bình thường. Có thể do kết nối mạng chậm hoặc lỗi hệ thống.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4">
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw size={16} />
                Thử lại
              </Button>
            )}
            
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Quay lại trang chủ
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AuthLoadingScreen;
