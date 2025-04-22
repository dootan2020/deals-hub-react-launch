
import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface DepositStatusBadgeProps {
  status: string;
}

const DepositStatusBadge: React.FC<DepositStatusBadgeProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <span className="flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span className="text-xs">Hoàn tất</span>
        </span>
      );
    case 'pending':
      return (
        <span className="flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          <span className="text-xs">Đang xử lý</span>
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          <span className="text-xs">Thất bại</span>
        </span>
      );
    default:
      return (
        <span className="flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
          <span className="text-xs">{status}</span>
        </span>
      );
  }
};

export default DepositStatusBadge;
