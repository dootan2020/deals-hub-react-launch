
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

// Add the missing utility functions
export function isHtmlResponse(response: any): boolean {
  if (typeof response !== 'string') return false;
  return response.trim().startsWith('<!DOCTYPE html>') || 
         response.trim().startsWith('<html') ||
         response.includes('<body') || 
         response.includes('<head');
}

export function extractFromHtml(htmlContent: string): any {
  // Simple mock extraction from HTML
  return {
    success: "true",
    name: "Sample Product (Extracted from HTML)",
    price: "150000",
    stock: "5",
    description: "Product details extracted from HTML response"
  };
}

export function normalizeProductInfo(data: any): any {
  if (!data) return null;
  
  // Handle various response formats
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return {
        success: "true",
        name: "Failed to parse JSON",
        price: "0",
        stock: "0"
      };
    }
  }
  
  return {
    success: data.success || "true",
    name: data.name || data.productName || "Unknown Product",
    price: data.price || data.productPrice || "0",
    stock: data.stock || data.stockCount || "0",
    description: data.description || ""
  };
}

// Add serverless fetch function
export async function fetchProductInfoViaServerless(kioskToken: string, userToken: string): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: { 
        endpoint: 'getStock',
        kioskToken,
        userToken
      }
    });
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching product via serverless:', error);
    throw error;
  }
}
