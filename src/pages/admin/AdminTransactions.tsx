
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle, 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction, Deposit } from '@/hooks/transactionUtils';

const AdminTransactions = () => {
  const { 
    transactions, 
    loading: transactionsLoading, 
    deposits, 
    loading: depositsLoading,
    updateDepositStatus
  } = useTransactions();
  
  const [isViewDepositDialogOpen, setIsViewDepositDialogOpen] = useState(false);
  const [currentDeposit, setCurrentDeposit] = useState<Deposit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewTab, setViewTab] = useState<'deposits' | 'transactions'>('deposits');

  const handleViewDeposit = (deposit: Deposit) => {
    setCurrentDeposit(deposit);
    setIsViewDepositDialogOpen(true);
  };

  const handleUpdateStatus = async (depositId: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      await updateDepositStatus(depositId, newStatus);
      
      if (currentDeposit && currentDeposit.id === depositId) {
        setCurrentDeposit({
          ...currentDeposit,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success(`Cập nhật trạng thái thành ${newStatus}`);
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const loading = transactionsLoading || depositsLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý giao dịch</h2>
        <div className="flex space-x-2">
          <Button 
            variant={viewTab === 'deposits' ? 'default' : 'outline'} 
            onClick={() => setViewTab('deposits')}
          >
            Nạp tiền
          </Button>
          <Button 
            variant={viewTab === 'transactions' ? 'default' : 'outline'} 
            onClick={() => setViewTab('transactions')}
          >
            Giao dịch
          </Button>
        </div>
      </div>

      {viewTab === 'deposits' && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử nạp tiền</CardTitle>
            <CardDescription>
              Quản lý tất cả các giao dịch nạp tiền qua PayPal trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Nhận được</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>PayPal ID</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày nạp</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits && deposits.length > 0 ? (
                      deposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell className="font-mono text-xs">
                            {deposit.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{deposit.user || deposit.user_id}</TableCell>
                          <TableCell>${deposit.amount}</TableCell>
                          <TableCell>${deposit.net_amount}</TableCell>
                          <TableCell>{deposit.payment_method}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {deposit.transaction_id ? `${deposit.transaction_id.substring(0, 8)}...` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeVariant(deposit.status)}>
                              {deposit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(deposit.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDeposit(deposit)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10">
                          Không có giao dịch nạp tiền nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              Xem tất cả các giao dịch trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Phương thức</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs">
                            {transaction.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{transaction.user || transaction.user_id}</TableCell>
                          <TableCell>
                            <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                              ${Math.abs(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              transaction.type === 'deposit' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeVariant(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          Không có giao dịch nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Deposit Dialog */}
      <Dialog open={isViewDepositDialogOpen} onOpenChange={setIsViewDepositDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chi tiết nạp tiền</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và cập nhật trạng thái.
            </DialogDescription>
          </DialogHeader>
          {currentDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">ID giao dịch</p>
                  <p className="font-mono text-sm">{currentDeposit.id}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Ngày tạo</p>
                  <p>{formatDate(currentDeposit.created_at)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Người dùng</p>
                <p>{currentDeposit.user || currentDeposit.user_id}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Số tiền</p>
                  <p className="text-lg font-bold">${currentDeposit.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Số tiền nhận được</p>
                  <p>${currentDeposit.net_amount}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500">Phương thức thanh toán</p>
                <p>{currentDeposit.payment_method}</p>
              </div>
              
              {currentDeposit.payer_email && (
                <div>
                  <p className="text-sm font-semibold text-gray-500">Email người thanh toán</p>
                  <p>{currentDeposit.payer_email}</p>
                </div>
              )}
              
              {currentDeposit.payer_id && (
                <div>
                  <p className="text-sm font-semibold text-gray-500">ID người thanh toán</p>
                  <p className="font-mono">{currentDeposit.payer_id}</p>
                </div>
              )}
              
              {currentDeposit.transaction_id && (
                <div>
                  <p className="text-sm font-semibold text-gray-500">ID giao dịch PayPal</p>
                  <p className="font-mono">{currentDeposit.transaction_id}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Trạng thái</p>
                <Select
                  value={currentDeposit.status}
                  onValueChange={(value) => handleUpdateStatus(currentDeposit.id, value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pending">Đang chờ</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                      <SelectItem value="failed">Thất bại</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Chú ý: Nếu bạn đổi trạng thái sang "Hoàn thành", hệ thống sẽ cộng tiền vào tài khoản người dùng.
                </p>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  onClick={() => setIsViewDepositDialogOpen(false)}
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransactions;
