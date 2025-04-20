
import { useQuery } from '@tanstack/react-query';
import { fetchProxySettings, ProxyConfig } from '@/utils/proxyUtils';

/**
 * Hook to fetch and provide proxy configuration settings
 */
export const useProxyConfig = () => {
  const { data: proxyConfig, isLoading, error } = useQuery({
    queryKey: ['proxy-settings'],
    queryFn: async (): Promise<ProxyConfig> => {
      try {
        return await fetchProxySettings();
      } catch (error) {
        console.error('Error fetching proxy settings:', error);
        // Return default configuration
        return { type: 'allorigins' };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    proxyConfig: proxyConfig || { type: 'allorigins' },
    isLoading,
    error
  };
};
