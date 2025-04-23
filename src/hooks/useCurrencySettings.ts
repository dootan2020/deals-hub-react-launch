
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { extractSafeData } from '@/utils/supabaseHelpers';
import { prepareQueryParam, isSupabaseError, getSafeProperty } from '@/utils/supabaseTypeUtils';

interface CurrencySettings {
  vnd_per_usd: number;
}

export const useCurrencySettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'usd-rate'],
    queryFn: async (): Promise<CurrencySettings> => {
      const result = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', prepareQueryParam('usd_rate'))
        .single();
        
      if (result.error) {
        console.error('Error fetching currency settings:', result.error);
        return { vnd_per_usd: 24000 }; // Fallback rate
      }
      
      const data = extractSafeData<{ value: Record<string, any> }>(result);
      
      // Check if data is a Supabase error
      if (isSupabaseError(data)) {
        return { vnd_per_usd: 24000 }; // Fallback rate
      }
      
      // Safely cast the JSON data to our expected type
      return { 
        vnd_per_usd: getSafeProperty(data?.value, 'vnd_per_usd', 24000)
      };
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 35 * 60 * 1000, // Keep in cache for 35 minutes
  });
};
