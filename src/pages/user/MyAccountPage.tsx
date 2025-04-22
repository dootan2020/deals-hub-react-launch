
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { Wallet, ShoppingBag, Clock, User, Lock, RefreshCw } from "lucide-react";
import Layout from '@/components/layout/Layout';
import OrderHistoryTab from '@/components/account/OrderHistoryTab';
import DepositHistoryTab from '@/components/account/DepositHistoryTab';
import InvoiceHistoryTab from '@/components/account/InvoiceHistoryTab';
import AccountStats from '@/components/account/AccountStats';
import AccountProfile from '@/components/account/AccountProfile';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import AccountStatsLoader from '@/components/account/AccountStatsLoader';
import { useAccountData } from '@/hooks/useAccountData';

const TabTriggers = React.memo(() => (
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
      <Clock className="mr-2 h-4 w-4" />
      Invoices
    </TabsTrigger>
    <TabsTrigger value="password">
      <Lock className="mr-2 h-4 w-4" />
      Change Password
    </TabsTrigger>
  </TabsList>
));

const MyAccountPage = () => {
  const { user, refreshUserBalance, userBalance, isLoadingBalance } = useAuth();
  const navigate = useNavigate();
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const { totalDeposited, totalOrders, lastLoginAt, isLoading, error, refetch } = useAccountData();

  // Memoize the refresh balance handler
  const handleRefreshBalance = useCallback(async () => {
    if (!user || isRefreshingBalance) return;
    
    setIsRefreshingBalance(true);
    try {
      await refreshUserBalance();
      toast("Balance updated successfully");
    } catch (error) {
      toast("Could not update balance");
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [user, isRefreshingBalance, refreshUserBalance]);

  // Guard against no user
  if (!user) {
    navigate('/login');
    return null;
  }

  // Memoize content based on loading state
  const content = useMemo(() => {
    if (error) {
      return (
        <div className="text-red-500 text-center py-8">
          {error}
          <Button variant="outline" onClick={refetch} className="ml-2">
            Retry
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return <AccountStatsLoader />;
    }

    return (
      <>
        <AccountStats 
          balance={userBalance}
          totalDeposited={totalDeposited}
          totalOrders={totalOrders}
          lastLoginAt={lastLoginAt}
          isLoadingBalance={isLoadingBalance}
        />

        <Tabs defaultValue="profile" className="mt-8">
          <TabTriggers />
          
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
    );
  }, [isLoading, error, refetch, userBalance, totalDeposited, totalOrders, lastLoginAt, isLoadingBalance, user]);

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
            Update Balance
          </Button>
        </div>
        
        {content}
      </div>
    </Layout>
  );
};

export default MyAccountPage;
