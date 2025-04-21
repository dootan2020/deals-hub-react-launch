
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Wallet, ShoppingBag, Clock, User, Lock, Loader2, RefreshCw, FileText } from "lucide-react";
import Layout from '@/components/layout/Layout';
import OrderHistoryTab from '@/components/account/OrderHistoryTab';
import DepositHistoryTab from '@/components/account/DepositHistoryTab';
import InvoiceHistoryTab from '@/components/account/InvoiceHistoryTab';
import AccountStats from '@/components/account/AccountStats';
import AccountProfile from '@/components/account/AccountProfile';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';

const MyAccountPage = () => {
  const { user, refreshUserBalance, userBalance, isLoadingBalance } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [lastLoginAt, setLastLoginAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total deposits
        const { data: depositData, error: depositError } = await supabase
          .from('deposits')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (depositError) throw depositError;
        
        const depositTotal = depositData.reduce((total, item) => total + Number(item.amount), 0);
        setTotalDeposited(depositTotal);

        // Fetch total orders
        const { count, error: orderError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (orderError) throw orderError;
        setTotalOrders(count || 0);

        // Get last login information from auth.users
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session?.user?.last_sign_in_at) {
          setLastLoginAt(new Date(authData.session.user.last_sign_in_at));
        }

        // Refresh user balance
        await refreshUserBalance();
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast.error("Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [user, navigate, refreshUserBalance]);

  const handleRefreshBalance = async () => {
    if (!user || isRefreshingBalance) return;
    
    setIsRefreshingBalance(true);
    try {
      await refreshUserBalance();
      toast.success("Số dư đã được cập nhật");
    } catch (error) {
      toast.error("Không thể cập nhật số dư");
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Account</h1>
          <Button 
            variant="outline" 
            onClick={handleRefreshBalance}
            disabled={isRefreshingBalance || isLoadingBalance} 
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshingBalance || isLoadingBalance ? 'animate-spin' : ''}`} />
            Cập nhật số dư
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading your account information...</span>
          </div>
        ) : (
          <>
            <AccountStats 
              balance={userBalance}
              totalDeposited={totalDeposited}
              totalOrders={totalOrders}
              lastLoginAt={lastLoginAt}
              isLoadingBalance={isLoadingBalance}
            />

            <Tabs defaultValue="profile" className="mt-8">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Order History
                </TabsTrigger>
                <TabsTrigger value="deposits">
                  <Wallet className="mr-2 h-4 w-4" />
                  Deposit History
                </TabsTrigger>
                <TabsTrigger value="invoices">
                  <FileText className="mr-2 h-4 w-4" />
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <AccountProfile user={user} />
              </TabsContent>
              
              <TabsContent value="orders">
                <OrderHistoryTab userId={user.id} />
              </TabsContent>
              
              <TabsContent value="deposits">
                <DepositHistoryTab userId={user.id} />
              </TabsContent>
              
              <TabsContent value="invoices">
                <InvoiceHistoryTab userId={user.id} />
              </TabsContent>
              
              <TabsContent value="password">
                <ChangePasswordForm />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyAccountPage;
