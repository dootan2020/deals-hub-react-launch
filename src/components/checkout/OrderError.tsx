
import { AlertCircle } from 'lucide-react';

interface OrderErrorProps {
  error: string;
}

export function OrderError({ error }: OrderErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      <p className="text-red-700">{error}</p>
    </div>
  );
}
