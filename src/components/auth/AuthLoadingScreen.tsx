
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthLoadingScreenProps {
  onRetry?: () => void;
  onCancel?: () => void;
  message?: string;
  attempts?: number;
}

const AuthLoadingScreen = ({ onRetry, onCancel, message, attempts = 0 }: AuthLoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {message || "Đang xác minh phiên đăng nhập"}
          </h2>
          <p className="text-muted-foreground mb-6">
            Vui lòng đợi trong khi chúng tôi xác thực tài khoản...
          </p>

          {attempts > 0 && (
            <Alert variant="warning" className="mb-4">
              <AlertTitle>Kết nối đang gặp vấn đề</AlertTitle>
              <AlertDescription>
                Đã thử {attempts}/3 lần. {attempts >= 3 ? 'Vui lòng thử lại thủ công.' : 'Đang cố gắng kết nối...'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-center space-x-4 pt-2">
          {onRetry && (
            <Button 
              variant="outline"
              onClick={onRetry}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
          
          {onCancel && (
            <Button 
              variant="ghost"
              onClick={onCancel}
              className="flex items-center text-muted-foreground"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Trở về trang chủ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
