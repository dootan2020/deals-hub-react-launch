
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CurrencySettings {
  vnd_per_usd: number;
}

export const useCurrencySettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'usd-rate'],
    queryFn: async (): Promise<CurrencySettings> => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'usd_rate')
          .maybeSingle();
          
        if (error || !data) {
          console.error('Error fetching currency settings:', error);
          return { vnd_per_usd: 24000 }; // Fallback rate
        }
        
        // Safely cast the JSON data to our expected type
        const settings = data.value as Record<string, any>;
        return { 
          vnd_per_usd: settings?.vnd_per_usd || 24000 
        };
      } catch (e) {
        console.error('Error in useCurrencySettings:', e);
        return { vnd_per_usd: 24000 }; // Fallback rate on error
      }
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 35 * 60 * 1000, // Keep in cache for 35 minutes
  });
};
