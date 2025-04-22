
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuthTokens } from '@/types/auth.types';

const TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

export const useAuthTokens = () => {
  const [tokens, setTokens] = useState<AuthTokens>({
    access: null,
    refresh: null,
    expires: null
  });

  const refreshToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.session) {
        setTokens({
          access: data.session.access_token,
          refresh: data.session.refresh_token,
          expires: data.session.expires_in
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!tokens.expires) return;

    const timeUntilExpiry = tokens.expires - Math.floor(Date.now() / 1000);
    if (timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD) {
      refreshToken();
      return;
    }

    const refreshTimeout = setTimeout(
      refreshToken,
      (timeUntilExpiry - TOKEN_REFRESH_THRESHOLD) * 1000
    );

    return () => clearTimeout(refreshTimeout);
  }, [tokens.expires, refreshToken]);

  const clearTokens = useCallback(() => {
    setTokens({ access: null, refresh: null, expires: null });
  }, []);

  return {
    tokens,
    setTokens,
    refreshToken,
    clearTokens
  };
};
