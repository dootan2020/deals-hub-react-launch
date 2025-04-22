
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Deposit } from '@/types/deposits';
import { isDeposit, isValidArray, isSupabaseRecord } from '@/utils/supabaseHelpers';

interface DepositHistoryTabProps {
  userId: string;
}

const DepositHistoryTab = ({ userId }: DepositHistoryTabProps) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeposits = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isValidArray(data)) {
          const typedDeposits: Deposit[] = [];
          data.forEach(item => {
            if (isSupabaseRecord<Deposit>(item) && isDeposit(item)) {
              typedDeposits.push({ ...item, id: String(item.id) });
            }
          });
          setDeposits(typedDeposits);
        } else {
          setDeposits([]);
        }
      } catch (error) {
        setError('Failed to load deposit history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [userId]);

  const renderPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paypal':
        return <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>PayPal</span>;
      case 'binance':
        return <span className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>Binance</span>;
      case 'crypto':
      case 'usdt':
        return <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>Crypto</span>;
      default:
        return <span className="flex items-center"><span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>{method}</span>;
    }
  };

  const renderDepositStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading deposit history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 p-6">
          <Wallet className="h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-500">No Deposits Yet</h3>
          <p className="text-gray-400 text-center mt-2">
            You haven't made any deposits yet. Add funds to your account to see your transaction history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit History</CardTitle>
        <CardDescription>View your account funding history</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell className="font-medium">{(deposit.transaction_id || deposit.id).slice(0, 8)}...</TableCell>
                <TableCell>
                  {new Date(deposit.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell>{renderPaymentMethod(deposit.payment_method)}</TableCell>
                <TableCell>{formatCurrency(deposit.amount)}</TableCell>
                <TableCell>{formatCurrency(deposit.net_amount)}</TableCell>
                <TableCell>{renderDepositStatus(deposit.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DepositHistoryTab;
