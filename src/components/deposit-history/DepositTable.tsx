
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Deposit } from '@/types/deposits';
import DepositStatusBadge from './DepositStatusBadge';

interface DepositTableProps {
  deposits: Deposit[];
}

const DepositTable = ({ deposits }: DepositTableProps) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Giao dịch</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map(deposit => (
            <TableRow key={deposit.id}>
              <TableCell>
                {formatDateTime(deposit.created_at)}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {deposit.payment_method === 'paypal' ? (
                    <span className="font-medium">PayPal</span>
                  ) : (
                    <span>{deposit.payment_method}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {deposit.transaction_id ? deposit.transaction_id.substring(0, 16) + '...' : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div>
                  <div className="font-medium">{formatCurrency(deposit.amount)}</div>
                  {deposit.status === 'completed' && (
                    <div className="text-xs text-gray-500">
                      Thực nhận: {formatCurrency(deposit.net_amount)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DepositStatusBadge status={deposit.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepositTable;
