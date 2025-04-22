
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface AuthLoadingScreenProps {
  onRetry?: () => void;
  message?: string;
  attempts?: number;
  isWaitingTooLong?: boolean;
}

const AuthLoadingScreen = ({ 
  onRetry, 
  message = "Đang xác minh phiên đăng nhập...",
  attempts = 0,
  isWaitingTooLong = false
}: AuthLoadingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Animated logo placeholder */}
        <div className="flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        
        {/* Loading message */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            {message}
          </h2>
          
          {/* Loading bars */}
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-5/6 mx-auto" />
            <Skeleton className="h-2 w-4/6 mx-auto" />
          </div>
          
          {/* Additional info for long waits */}
          {isWaitingTooLong && (
            <p className="text-sm text-muted-foreground mt-4">
              Quá trình này đang mất nhiều thời gian hơn dự kiến...
            </p>
          )}
          
          {/* Retry button if provided */}
          {onRetry && (
            <div className="mt-6">
              <Button 
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Thử lại {attempts > 0 ? `(Lần ${attempts})` : ''}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
