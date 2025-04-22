
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth.types';
import { getCachedData, setCachedData, CACHE_KEYS, TTL } from '@/utils/cacheUtils';
import { prepareTableId } from '@/utils/databaseTypes';

export const useUserData = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      // Check cache first
      const cachedRoles = getCachedData<UserRole[]>(
        `${CACHE_KEYS.USER_ROLES}_${userId}`
      );
      
      if (cachedRoles) {
        return cachedRoles;
      }

      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: userId
      });

      if (error) throw error;

      const roles = data as UserRole[];
      setCachedData(`${CACHE_KEYS.USER_ROLES}_${userId}`, roles, TTL.PROFILE);
      return roles;
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  const fetchUserBalance = useCallback(async (userId: string) => {
    if (isLoadingBalance) return userBalance;
    
    setIsLoadingBalance(true);
    
    try {
      const cachedBalance = getCachedData<number>(
        `${CACHE_KEYS.USER_BALANCE}_${userId}`,
        { ttl: 30000 } // 30 seconds for balance
      );
      
      if (cachedBalance !== null) {
        setUserBalance(cachedBalance);
        return cachedBalance;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', prepareTableId('profiles', userId))
        .single();

      if (error) throw error;

      const balance = data?.balance || 0;
      setUserBalance(balance);
      setCachedData(`${CACHE_KEYS.USER_BALANCE}_${userId}`, balance);
      
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
