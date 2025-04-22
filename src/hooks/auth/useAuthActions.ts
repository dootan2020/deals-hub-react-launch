
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AuthActions } from './auth-types';

export const useAuthActions = (): AuthActions => {
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      return !!data.session;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await Promise.all([
        supabase.from('user_roles').select('role').eq('id', session.user.id),
        supabase.from('profiles').select('balance').eq('id', session.user.id)
      ]);
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }, []);

  const refreshUserBalance = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return 0;
      
      const { data } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', session.user.id)
        .single();
        
      return data?.balance ?? 0;
    } catch (error) {
      console.error('Balance refresh error:', error);
      return 0;
    }
  }, []);

  return {
    login,
    logout,
    register,
    refreshSession,
    refreshUserProfile,
    refreshUserBalance
  };
};
