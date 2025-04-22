
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseRecord } from './supabaseHelpers';

interface ApiConfig {
  user_token: string;
  kiosk_token?: string;
  [key: string]: any;
}

export async function fetchActiveApiConfig(): Promise<ApiConfig> {
  const { data, error } = await supabase
    .from('api_configs')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching API config:', error);
    return { user_token: '' };
  }

  if (isSupabaseRecord<ApiConfig>(data)) {
    return data;
  }

  return { user_token: '' };
}

export async function saveApiConfig(config: Partial<ApiConfig>) {
  const { error } = await supabase
    .from('api_configs')
    .insert([{
      ...config,
      is_active: true
    }]);

  if (error) {
    throw new Error(`Failed to save API config: ${error.message}`);
  }

  return { success: true };
}
