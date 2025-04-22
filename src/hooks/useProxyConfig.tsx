
import { useQuery } from '@tanstack/react-query';
import { fetchProxySettings, ProxyConfig } from '@/utils/proxyUtils';
import { getCachedData, setCachedData, CACHE_KEYS, TTL } from '@/utils/cacheUtils';

export const useProxyConfig = () => {
  const { data: proxyConfig, isLoading, error } = useQuery({
    queryKey: ['proxy-settings'],
    queryFn: async (): Promise<ProxyConfig> => {
      // Check cache first
      const cached = getCachedData<ProxyConfig>(CACHE_KEYS.PROXY_CONFIG, {
        ttl: TTL.SETTINGS
      });
      
      if (cached) return cached;

      // Fetch fresh data
      try {
        const config = await fetchProxySettings();
        setCachedData(CACHE_KEYS.PROXY_CONFIG, config, TTL.SETTINGS);
        return config;
      } catch (error) {
        console.error('Error fetching proxy settings:', error);
        return { type: 'allorigins' };
      }
    },
    staleTime: TTL.SETTINGS,
    gcTime: TTL.SETTINGS * 2,
  });

  return {
    proxyConfig: proxyConfig || { type: 'allorigins' },
    isLoading,
    error
  };
};
