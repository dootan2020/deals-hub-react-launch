
interface PayPalStateErrorProps {
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const PayPalStateError = ({ errorMessage, onRetry }: PayPalStateErrorProps) => {
  return (
    <div className="p-4 border border-red-200 rounded-md bg-red-50">
      <p className="font-medium text-red-700">PayPal không khả dụng</p>
      <p className="text-sm text-red-600 mt-1">{errorMessage || 'Lỗi kết nối với PayPal'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};
