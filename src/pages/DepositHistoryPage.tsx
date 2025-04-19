import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { processAllPendingDeposits } from '@/utils/payment';
import { Deposit } from '@/types/deposits';
import LoadingState from '@/components/deposit-history/LoadingState';
import EmptyState from '@/components/deposit-history/EmptyState';
import DepositTable from '@/components/deposit-history/DepositTable';
import PendingTransactionsAlert from '@/components/deposit-history/PendingTransactionsAlert';

const DepositHistoryPage = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user, refreshUserBalance } = useAuth();
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }) as { data: Deposit[] | null, error: any };
      
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

  const handleProcessPendingDeposits = async () => {
    try {
      setIsProcessing(true);
      toast.info('Đang kiểm tra và xử lý các giao dịch nạp tiền...');
      
      const result = await processAllPendingDeposits();
      
      if (result.success) {
        if (result.count > 0) {
          toast.success(`Đã xử lý thành công ${result.count} giao dịch nạp tiền`);
          await refreshUserBalance();
          await fetchDepositHistory();
        } else {
          toast.info('Không có giao dịch nạp tiền nào cần xử lý');
        }
      } else {
        toast.error(`Có lỗi xảy ra: ${result.error || 'Không thể xử lý giao dịch'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if there are any pending deposits with transaction IDs that need processing
  const pendingDepositsWithTransactions = deposits.filter(
    deposit => deposit.status === 'pending' && deposit.transaction_id
  );

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
            
            {pendingDepositsWithTransactions.length > 0 && (
              <Button
                onClick={handleProcessPendingDeposits}
                disabled={isProcessing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'Đang xử lý...' : 'Xử lý giao dịch đang chờ'}
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch nạp tiền</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : deposits.length === 0 ? (
                <EmptyState />
              ) : (
                <DepositTable deposits={deposits} />
              )}
            </CardContent>
            
            {pendingDepositsWithTransactions.length > 0 && (
              <CardFooter>
                <PendingTransactionsAlert count={pendingDepositsWithTransactions.length} />
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DepositHistoryPage;
