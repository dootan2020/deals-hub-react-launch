
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/helpers';
import { Wallet } from 'lucide-react';

const DepositPage = () => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUserBalance, userBalance } = useAuth();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Authentication required", "Please log in to deposit funds");
      return;
    }
    
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Invalid amount", "Please enter a valid amount");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add deposit record
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          net_amount: depositAmount,
          payment_method: 'manual',
          status: 'completed'
        })
        .select()
        .single();
      
      if (depositError) throw depositError;
      
      // Update user balance
      const { error: balanceError } = await supabase.rpc(
        'update_user_balance',
        {
          user_id_param: user.id,
          amount_param: depositAmount
        }
      );
      
      if (balanceError) throw balanceError;
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          payment_method: 'manual',
          status: 'completed',
          type: 'deposit'
        });
      
      if (transactionError) throw transactionError;
      
      // Clear form and show success message
      setAmount('');
      toast.success("Deposit successful", `${formatCurrency(depositAmount)} has been added to your account`);
      
      // Refresh user balance
      if (refreshUserBalance) {
        await refreshUserBalance();
      }
      
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error("Deposit failed", error.message || "An error occurred during deposit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Deposit Funds</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Funds to Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-sm font-medium">
                    Amount (VND)
                  </label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      className="pl-12"
                      disabled={isLoading}
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">VND</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || !amount}
                >
                  {isLoading ? 'Processing...' : 'Deposit Funds'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Balance Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-3">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(userBalance || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2 text-sm">
                <p>• Deposits are processed instantly</p>
                <p>• Minimum deposit amount: 50,000 VND</p>
                <p>• Your funds will be available immediately</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DepositPage;
