
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Check, 
  X, 
  Loader2, 
  Wallet,
  Calendar,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  transaction_id?: string;
  user?: {
    email: string;
  };
  payer_email?: string;
  payer_id?: string;
  net_amount?: number;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onStatusChange: (transactionId: string, newStatus: string) => Promise<void>;
  onViewDetails: (transaction: Transaction) => void;
}

export function TransactionsTable({ 
  transactions, 
  isLoading, 
  onStatusChange,
  onViewDetails 
}: TransactionsTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    try {
      setProcessingId(transactionId);
      await onStatusChange(transactionId, newStatus);
      
      if (newStatus === 'completed') {
        toast.success("Giao dịch đã duyệt", "Tiền đã được cộng vào tài khoản người dùng");
      } else if (newStatus === 'cancelled') {
        toast.info("Giao dịch đã hủy", "Giao dịch đã bị hủy thành công");
      }
    } catch (error) {
      toast.error("Lỗi xử lý", "Không thể cập nhật trạng thái giao dịch");
      console.error("Error updating transaction status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
    onViewDetails(transaction);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Hoàn thành</Badge>;
      case 'processing':
      case 'pending':
        return <Badge className="bg-yellow-500">Đang xử lý</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Đang tải danh sách giao dịch...</span>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  {formatDate(transaction.created_at)}
                </TableCell>
                <TableCell>
                  {transaction.payer_email || transaction.user?.email || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {transaction.payment_method}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(transaction.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                    {transaction.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={() => handleStatusChange(transaction.id, 'completed')}
                          disabled={processingId === transaction.id}
                        >
                          {processingId === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100"
                          onClick={() => handleStatusChange(transaction.id, 'cancelled')}
                          disabled={processingId === transaction.id}
                        >
                          {processingId === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Hủy
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Wallet className="h-12 w-12 mb-2 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">Không có giao dịch</h3>
                  <p>Chưa có giao dịch nạp tiền nào trong hệ thống.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch #{selectedTransaction?.id.substring(0, 8)}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Thông tin giao dịch</h3>
              <div className="bg-muted/40 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span>{getStatusBadge(selectedTransaction?.status || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{formatDate(selectedTransaction?.created_at || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cập nhật:</span>
                  <span>{formatDate(selectedTransaction?.updated_at || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức:</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedTransaction?.payment_method || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Số tiền:</span>
                  <span>{selectedTransaction?.amount ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(selectedTransaction.amount) : 'N/A'}</span>
                </div>
                {selectedTransaction?.net_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tiền thực nhận:</span>
                    <span>{new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(selectedTransaction.net_amount)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Thông tin người dùng</h3>
              <div className="bg-muted/40 p-4 rounded-md space-y-2">
                <div>
                  <span className="text-muted-foreground block">ID người dùng:</span>
                  <span className="text-xs break-all">{selectedTransaction?.user_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{selectedTransaction?.payer_email || selectedTransaction?.user?.email || 'N/A'}</span>
                </div>
                {selectedTransaction?.payer_id && (
                  <div>
                    <span className="text-muted-foreground">ID người thanh toán:</span>
                    <span className="ml-2">{selectedTransaction.payer_id}</span>
                  </div>
                )}
                {selectedTransaction?.transaction_id && (
                  <div>
                    <span className="text-muted-foreground">Mã giao dịch:</span>
                    <span className="ml-2">{selectedTransaction.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
            >
              Đóng
            </Button>
            
            {selectedTransaction?.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleStatusChange(selectedTransaction.id, 'completed');
                    setIsDetailsOpen(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Duyệt giao dịch
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleStatusChange(selectedTransaction.id, 'cancelled');
                    setIsDetailsOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TransactionsTable;
