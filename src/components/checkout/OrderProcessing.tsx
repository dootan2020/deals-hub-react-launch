
import { Package } from 'lucide-react';

export function OrderProcessing() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
      <p className="font-medium text-blue-700 mb-1 flex items-center">
        <Package className="h-5 w-5 mr-2" />
        Order is being processed
      </p>
      <p className="text-blue-600 mb-3">
        Please wait while we prepare your order. This usually takes 5-10 seconds.
      </p>
      
      <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1">
        <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
      </div>
      <p className="text-xs text-blue-500 text-right">Waiting for confirmation...</p>
    </div>
  );
}
