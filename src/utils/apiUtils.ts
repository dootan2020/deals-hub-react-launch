
import { supabase } from '@/integrations/supabase/client';

interface ApiConfig {
  id: string;
  name: string;
  user_token: string;
  kiosk_token: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function fetchActiveApiConfig(): Promise<ApiConfig> {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching API config:', error);
      throw new Error('Failed to fetch API configuration');
    }

    // Use type assertion to ensure type safety
    return data as ApiConfig;
  } catch (error) {
    console.error('Error in fetchActiveApiConfig:', error);
    throw error;
  }
}

export async function saveApiConfig(config: Partial<ApiConfig>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_configs')
      .insert({
        name: config.name || 'Default API Config',
        user_token: config.user_token || '',
        kiosk_token: config.kiosk_token || '',
        is_active: config.is_active !== undefined ? config.is_active : true,
      });

    if (error) {
      console.error('Error saving API config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveApiConfig:', error);
    return false;
  }
}
