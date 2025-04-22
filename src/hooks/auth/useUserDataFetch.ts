
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth.types';
import { prepareTableId } from '@/utils/databaseTypes';

/**
 * Hook for fetching user-specific data like roles and balance
 * Separated from auth state to reduce complexity
 */
export const useUserDataFetch = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch roles for the current user with caching and error handling
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      // Check if we have roles in local storage and they're not older than 5 minutes
      const cachedRolesData = localStorage.getItem(`user_roles_${userId}`);
      if (cachedRolesData) {
        try {
          const { roles, timestamp } = JSON.parse(cachedRolesData);
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          
          if (timestamp > fiveMinutesAgo) {
            console.debug('Using cached user roles');
            return roles as UserRole[];
          }
        } catch (e) {
          console.error('Error parsing cached roles:', e);
          // Continue to fetch roles if cache parsing fails
        }
      }
      
      console.debug(`Fetching roles for user ${userId}`);
      
      // Try to use the RPC function first (faster)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_roles', {
          user_id_param: userId
        });
        
        if (!rpcError && Array.isArray(rpcData)) {
          // Cache roles in localStorage with timestamp
          localStorage.setItem(`user_roles_${userId}`, JSON.stringify({
            roles: rpcData,
            timestamp: Date.now()
          }));
          
          return rpcData as UserRole[];
        }
      } catch (rpcErr) {
        console.warn('RPC get_user_roles failed, falling back to direct query', rpcErr);
      }
      
      // Fall back to direct query if RPC fails
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', prepareTableId('user_roles', userId));
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      const roles = (data || []).map(item => item.role as UserRole);
      
      // Cache roles in localStorage with timestamp
      localStorage.setItem(`user_roles_${userId}`, JSON.stringify({
        roles,
        timestamp: Date.now()
      }));
      
      return roles;
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  // Fetch user balance with caching and error handling
  const fetchUserBalance = useCallback(async (userId: string) => {
    if (isLoadingBalance) return userBalance; // Prevent concurrent balance fetch requests
    
    console.debug(`Fetching balance for user ${userId}`);
    setIsLoadingBalance(true);
    
    try {
      // Check for cached balance that's not older than 30 seconds
      const cachedBalanceData = localStorage.getItem(`user_balance_${userId}`);
      if (cachedBalanceData) {
        try {
          const { balance, timestamp } = JSON.parse(cachedBalanceData);
          const thirtySecondsAgo = Date.now() - 30 * 1000;
          
          if (timestamp > thirtySecondsAgo) {
            console.debug('Using cached user balance');
            setUserBalance(balance);
            return balance;
          }
        } catch (e) {
          console.error('Error parsing cached balance:', e);
          // Continue to fetch balance if cache parsing fails
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', prepareTableId('profiles', userId))
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return userBalance; // Return current balance on error
      }
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      
      // Cache balance in localStorage
      localStorage.setItem(`user_balance_${userId}`, JSON.stringify({
        balance,
        timestamp: Date.now()
      }));
      
      return balance;
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      return userBalance; // Return current balance on error
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
