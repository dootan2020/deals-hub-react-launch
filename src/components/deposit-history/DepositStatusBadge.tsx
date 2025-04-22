
import { Badge } from '@/components/ui/badge';

interface DepositStatusBadgeProps {
  status: string;
}

const DepositStatusBadge = ({ status }: DepositStatusBadgeProps) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="success">Thành công</Badge>;
    case 'pending':
      return <Badge variant="warning">Đang xử lý</Badge>;
    case 'failed':
      return <Badge variant="destructive">Thất bại</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Đã hủy</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default DepositStatusBadge;
