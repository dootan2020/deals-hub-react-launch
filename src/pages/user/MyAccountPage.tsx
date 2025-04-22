
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  
  // Track mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Memoize fetchUserStats to prevent unnecessary recreations
  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Use Promise.all for parallel API calls
      const [depositData, orderData, authData] = await Promise.all([
        // Fetch total deposits
        supabase
          .from('deposits')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'completed'),
          
        // Fetch total orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
          
        // Get last login info
        supabase.auth.getSession()
      ]);

      // Only update state if component is still mounted
      if (!isMounted.current) return;

      // Handle deposit data
      if (!depositData.error && depositData.data) {
        const depositTotal = depositData.data.reduce((total, item) => 
          total + Number(item.amount), 0);
        setTotalDeposited(depositTotal);
      }

      // Handle order count
      if (!orderData.error) {
        setTotalOrders(orderData.count || 0);
      }

      // Handle last login
      if (authData?.data?.session?.user?.last_sign_in_at) {
        setLastLoginAt(new Date(authData.data.session.user.last_sign_in_at));
      }

      // Refresh balance
      await refreshUserBalance();
      
    } catch (error) {
      console.error("Error fetching user stats:", error);
      if (isMounted.current) {
        toast("Không thể tải thông tin tài khoản", {
          description: "Vui lòng thử lại sau",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, refreshUserBalance]);

  // Load user stats on mount and when user changes
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const handleRefreshBalance = async () => {
    if (!user || isRefreshingBalance) return;
    
    setIsRefreshingBalance(true);
    try {
      await refreshUserBalance();
      if (isMounted.current) {
        toast("Số dư đã được cập nhật");
      }
    } catch (error) {
      if (isMounted.current) {
        toast("Không thể cập nhật số dư");
      }
    } finally {
      if (isMounted.current) {
        setIsRefreshingBalance(false);
      }
    }
  };

  // Edge case: no user
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
