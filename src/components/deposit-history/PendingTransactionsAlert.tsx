
interface PendingTransactionsAlertProps {
  count: number;
}

const PendingTransactionsAlert = ({ count }: PendingTransactionsAlertProps) => {
  return (
    <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-md">
      <p className="text-sm text-amber-800">
        Có {count} giao dịch có mã giao dịch nhưng chưa được xử lý. 
        Nhấn "Xử lý giao dịch đang chờ" để cập nhật.
      </p>
    </div>
  );
};

export default PendingTransactionsAlert;
