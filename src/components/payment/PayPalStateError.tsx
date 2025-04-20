
import { Button } from "@/components/ui/button";

interface PayPalStateErrorProps {
  errorMessage: string;
  onRetry: () => void;
}

export const PayPalStateError: React.FC<PayPalStateErrorProps> = ({ errorMessage, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-6 border border-red-200 rounded-md p-4 bg-red-50">
    <div className="text-red-600 mb-3">{errorMessage}</div>
    <Button onClick={onRetry} variant="outline">
      Thử lại
    </Button>
  </div>
);
