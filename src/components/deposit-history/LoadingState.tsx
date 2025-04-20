
import { Loader } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
        <Loader className="h-10 w-10 animate-spin text-primary relative" />
      </div>
      <p className="text-muted-foreground">Đang tải lịch sử giao dịch...</p>
    </div>
  );
};

export default LoadingState;
