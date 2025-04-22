
import { useQuery } from '@tanstack/react-query';
import { fetchProxySettings, ProxyConfig } from '@/utils/proxyUtils';

/**
 * Hook to fetch and provide proxy configuration settings
 */
export const useProxyConfig = () => {
  const { data: proxyConfig, isLoading, error, refetch } = useQuery({
    queryKey: ['proxy-settings'],
    queryFn: async (): Promise<ProxyConfig> => {
      try {
        console.log('Fetching proxy settings...');
        const config = await fetchProxySettings();
        console.log('Retrieved proxy settings:', config);
        return config;
      } catch (error) {
        console.error('Error fetching proxy settings:', error);
        // Return default configuration on error
        return { type: 'allorigins' };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });

  return {
    proxyConfig: proxyConfig || { type: 'allorigins' },
    isLoading,
    error,
    refetch
  };
};
