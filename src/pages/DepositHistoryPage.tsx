
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DepositRecord {
  id: string;
  amount: number;
  net_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

const DepositHistoryPage = () => {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchDepositHistory();
  }, [user, navigate]);

  const fetchDepositHistory = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching deposit history:', error);
        return;
      }
      
      setDeposits(data || []);
    } catch (error) {
      console.error('Error in fetchDepositHistory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  return (
    <Layout>
      <Helmet>
        <title>Lịch sử nạp tiền | Digital Deals Hub</title>
        <meta name="description" content="Xem lịch sử nạp tiền vào tài khoản của bạn" />
      </Helmet>
      
      <div className="container-custom py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <Wallet className="mr-3 h-7 w-7 text-primary" />
              Lịch sử nạp tiền
            </h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch nạp tiền</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <Clock className="animate-spin h-8 w-8 mx-auto text-primary mb-4" />
                  <p>Đang tải...</p>
                </div>
              ) : deposits.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Bạn chưa có giao dịch nạp tiền nào.</p>
                </div>
              ) : (
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
                              <div className="font-medium">{formatCurrency(deposit.amount, '$')}</div>
                              {deposit.status === 'completed' && (
                                <div className="text-xs text-gray-500">
                                  Thực nhận: {formatCurrency(deposit.net_amount, '$')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(deposit.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DepositHistoryPage;
