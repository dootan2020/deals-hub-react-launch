
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

export const useUserData = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const cachedRolesData = localStorage.getItem(`user_roles_${userId}`);
      if (cachedRolesData) {
        const { roles, timestamp } = JSON.parse(cachedRolesData);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (timestamp > fiveMinutesAgo) {
          console.debug('Using cached user roles');
          return roles as UserRole[];
        }
      }
      
      console.debug(`Fetching roles for user ${userId}`);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      localStorage.setItem(`user_roles_${userId}`, JSON.stringify({
        roles: data,
        timestamp: Date.now()
      }));
      
      return data as UserRole[];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  const fetchUserBalance = useCallback(async (userId: string) => {
    if (isLoadingBalance) return userBalance;
    
    console.debug(`Fetching balance for user ${userId}`);
    setIsLoadingBalance(true);
    
    try {
      const cachedBalanceData = localStorage.getItem(`user_balance_${userId}`);
      if (cachedBalanceData) {
        const { balance, timestamp } = JSON.parse(cachedBalanceData);
        const thirtySecondsAgo = Date.now() - 30 * 1000;
        
        if (timestamp > thirtySecondsAgo) {
          console.debug('Using cached user balance');
          setUserBalance(balance);
          return balance;
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return userBalance;
      }
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      
      localStorage.setItem(`user_balance_${userId}`, JSON.stringify({
        balance,
        timestamp: Date.now()
      }));
      
      return balance;
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      return userBalance;
    } finally {
      setIsLoadingBalance(false);
    }
  }, [userBalance, isLoadingBalance]);

  return {
    userRoles,
    setUserRoles,
    userBalance,
    setUserBalance,
    isLoadingBalance,
    fetchUserRoles,
    fetchUserBalance
  };
};
