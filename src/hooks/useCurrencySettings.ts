
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CurrencySettings {
  vnd_per_usd: number;
}

export const useCurrencySettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'usd-rate'],
    queryFn: async (): Promise<CurrencySettings> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'usd_rate')
        .single();
        
      if (error) {
        console.error('Error fetching currency settings:', error);
        return { vnd_per_usd: 25000 }; // Fallback rate
      }
      
      // Safely cast the JSON data to our expected type
      const settings = data?.value as Record<string, any>;
      return { 
        vnd_per_usd: settings?.vnd_per_usd || 25000 
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (previously cacheTime)
  });
};
