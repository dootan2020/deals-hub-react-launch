
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, XCircle } from "lucide-react";

interface AuthLoadingScreenProps {
  onRetry: () => void;
  onCancel: () => void;
}

const AuthLoadingScreen = ({ onRetry, onCancel }: AuthLoadingScreenProps) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-4">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Đang xác thực...</h3>
        <p className="text-muted-foreground max-w-md">
          Đang kiểm tra thông tin đăng nhập của bạn. Vui lòng chờ trong giây lát.
        </p>
      </div>
      
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onRetry}
          className="bg-transparent"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Hủy và quay lại
        </Button>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
