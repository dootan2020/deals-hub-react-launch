
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLoadingScreenProps {
  message?: string;
  onRetry?: () => void;
  attempts?: number;
  isWaitingTooLong?: boolean;
}

/**
 * Loading screen displayed during authentication processes
 * Provides feedback and retry options
 */
const AuthLoadingScreen = ({
  message = "Đang xác minh phiên đăng nhập...",
  onRetry,
  attempts = 0,
  isWaitingTooLong = false
}: AuthLoadingScreenProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-4">
            {onRetry ? (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Đang gặp vấn đề kết nối</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {attempts > 0 && `Lần thử thứ ${attempts}. `}
                  Không thể kết nối tới máy chủ xác thực. Vui lòng thử lại.
                </p>
                <Button onClick={onRetry} className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">{message}</h3>
                
                {isWaitingTooLong && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
                    <p className="text-sm text-amber-700">
                      Quá trình đang mất nhiều thời gian hơn dự kiến. 
                      Vui lòng kiểm tra kết nối mạng của bạn.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLoadingScreen;
