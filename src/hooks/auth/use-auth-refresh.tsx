
import { useState, useCallback } from 'react';
import { reloadSession } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useAuthRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const navigate = useNavigate();

  const attemptRefresh = useCallback(async () => {
    if (refreshing || attempts >= 3) return false;
    
    setRefreshing(true);
    console.log(`Attempting session refresh (attempt ${attempts + 1}/3)...`);
    
    try {
      const { success, error } = await reloadSession();
      
      if (success) {
        console.log("Session refreshed successfully");
        return true;
      } else {
        console.error("Session refresh failed:", error?.message || "Unknown error");
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) {
          setShowRetry(true);
        }
        return false;
      }
    } catch (error) {
      console.error("Error during session refresh:", error);
      setAttempts(prev => prev + 1);
      
      if (attempts >= 2) {
        setShowRetry(true);
      }
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, attempts]);

  const handleRetry = async () => {
    setShowRetry(false);
    setAttempts(0);
    
    const success = await attemptRefresh();
    if (!success) {
      toast({
        title: "Không thể khôi phục phiên",
        description: "Vui lòng đăng nhập lại để tiếp tục",
        variant: "destructive"
      });
      navigate('/login', { 
        state: { 
          authError: 'session_restore_failed' 
        },
        replace: true
      });
    }
  };

  return {
    refreshing,
    attempts,
    showRetry,
    attemptRefresh,
    handleRetry
  };
};
