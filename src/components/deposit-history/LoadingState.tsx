
import { Clock } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="py-8 text-center">
      <Clock className="animate-spin h-8 w-8 mx-auto text-primary mb-4" />
      <p>Đang tải...</p>
    </div>
  );
};

export default LoadingState;
