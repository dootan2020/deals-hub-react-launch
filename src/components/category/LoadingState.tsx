
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary mr-3" />
      <p className="text-gray-500">Loading category...</p>
    </div>
  );
};

export default LoadingState;
