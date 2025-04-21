
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface UserStatusBadgeProps {
  isActive: boolean;
}

export const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
  if (isActive) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="h-3.5 w-3.5 mr-1" />
        Đang hoạt động
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      <X className="h-3.5 w-3.5 mr-1" />
      Đã khóa
    </Badge>
  );
};
