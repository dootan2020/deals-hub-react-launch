
import { Calendar } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="py-8 text-center">
      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500">Bạn chưa có giao dịch nạp tiền nào.</p>
    </div>
  );
};

export default EmptyState;
