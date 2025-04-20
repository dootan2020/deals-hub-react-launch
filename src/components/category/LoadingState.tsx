
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px] py-12 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
        <Loader className="h-12 w-12 animate-spin text-primary relative" />
      </div>
      <p className="text-base text-muted-foreground font-medium animate-pulse">
        Đang tải danh mục sản phẩm...
      </p>
    </div>
  );
};

export default LoadingState;
