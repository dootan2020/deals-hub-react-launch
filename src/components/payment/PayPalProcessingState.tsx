
import { Loader2 } from "lucide-react";

export const PayPalProcessingState = () => (
  <div className="flex items-center justify-center py-6 border border-gray-200 rounded-md p-4 bg-white">
    <Loader2 className="animate-spin h-6 w-6 mr-2" />
    <span>Đang kết nối với PayPal...</span>
  </div>
);
