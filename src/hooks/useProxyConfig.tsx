
import { useState, useEffect } from 'react';
import { ProxyConfig } from '@/types';
import { fetchProxySettings } from '@/utils/proxyUtils';

export const useProxyConfig = () => {
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProxyConfig = async () => {
      try {
        setIsLoading(true);
        const config = await fetchProxySettings();
        setProxyConfig({
          proxy_type: config.proxy_type,
          custom_url: config.custom_url,
          type: config.type
        });
      } catch (err: any) {
        console.error('Error loading proxy config:', err);
        setError(err.message || 'Failed to load proxy configuration');
        // Use default configuration on error
        setProxyConfig({
          proxy_type: 'allorigins',
          custom_url: '',
          type: 'allorigins'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProxyConfig();
  }, []);

  return { proxyConfig, isLoading, error };
};
