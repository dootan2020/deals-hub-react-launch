
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions, Transaction, Deposit } from '@/hooks/useTransactions';
import TransactionsTable from '@/components/admin/transactions/TransactionsTable';

const TransactionsAdmin = () => {
  const { 
    transactions, 
    deposits, 
    loading, 
    fetchTransactions, 
    fetchDeposits,
    updateDepositStatus 
  } = useTransactions();
  
  const [activeTab, setActiveTab] = useState('deposits');
  const [filteredItems, setFilteredItems] = useState<Transaction[] | Deposit[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    filterItems();
  }, [activeTab, statusFilter, transactions, deposits]);

  const filterItems = () => {
    if (activeTab === 'deposits') {
      if (statusFilter === 'all') {
        setFilteredItems(deposits);
      } else {
        setFilteredItems(deposits.filter(deposit => deposit.status === statusFilter));
      }
    } else {
      if (statusFilter === 'all') {
        setFilteredItems(transactions);
      } else {
        setFilteredItems(transactions.filter(transaction => transaction.status === statusFilter));
      }
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStatusFilter('all');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDepositStatus(id, newStatus);
  };

  const handleViewDetails = (transaction: any) => {
    console.log('Viewing transaction details:', transaction);
  };

  const getTotalAmount = () => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getPendingDepositsCount = () => {
    return deposits.filter(d => d.status === 'pending').length;
  };

  return (
    <AdminLayout title="Quản lý giao dịch">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý giao dịch</h1>
          <p className="text-muted-foreground">Xem và quản lý các giao dịch nạp tiền trong hệ thống</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            fetchTransactions();
            fetchDeposits();
          }} 
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{deposits.length}</CardTitle>
            <CardDescription>Tổng yêu cầu nạp</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{getPendingDepositsCount()}</CardTitle>
            <CardDescription>Chờ xử lý</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {deposits.filter(d => d.status === 'completed').length}
            </CardTitle>
            <CardDescription>Thành công</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {new Intl.NumberFormat('vi-VN').format(getTotalAmount())} VND
            </CardTitle>
            <CardDescription>Tổng tiền nạp</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {getPendingDepositsCount() > 0 && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <InfoIcon className="h-5 w-5 text-yellow-500" />
          <AlertDescription className="text-yellow-700">
            Có {getPendingDepositsCount()} yêu cầu nạp tiền đang chờ xử lý. Vui lòng kiểm tra và xác nhận.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" /> Danh sách giao dịch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposits" onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="deposits">Nạp tiền ({deposits.length})</TabsTrigger>
              <TabsTrigger value="transactions">Tất cả giao dịch ({transactions.length})</TabsTrigger>
            </TabsList>
            
            <div className="mb-4">
              <TabsList>
                <TabsTrigger 
                  value="all"
                  onClick={() => setStatusFilter('all')}
                  data-state={statusFilter === 'all' ? 'active' : ''}
                >
                  Tất cả
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  onClick={() => setStatusFilter('pending')}
                  data-state={statusFilter === 'pending' ? 'active' : ''}
                >
                  Chờ xử lý
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  onClick={() => setStatusFilter('completed')}
                  data-state={statusFilter === 'completed' ? 'active' : ''}
                >
                  Thành công
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled"
                  onClick={() => setStatusFilter('cancelled')}
                  data-state={statusFilter === 'cancelled' ? 'active' : ''}
                >
                  Đã hủy
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="deposits">
              <TransactionsTable 
                transactions={filteredItems as Deposit[]}
                isLoading={loading}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionsTable 
                transactions={filteredItems as Transaction[]}
                isLoading={loading}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default TransactionsAdmin;
