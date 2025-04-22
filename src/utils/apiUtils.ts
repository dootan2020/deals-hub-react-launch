
import { supabase } from '@/integrations/supabase/client';
import { isValidRecord } from './supabaseHelpers';
import { fetchViaProxy, ProxyConfig } from './proxyUtils';

export interface ApiConfig {
  user_token?: string;
  kiosk_token?: string;
  [key: string]: any;
}

export async function fetchActiveApiConfig(): Promise<ApiConfig> {
  try {
    const { data, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data || {};
  } catch (error) {
    console.error('Error fetching active API config:', error);
    return {};
  }
}

// Helper function to determine if a response is HTML or JSON
export function isHtmlResponse(response: any): boolean {
  if (typeof response !== 'string') return false;
  return response.trim().startsWith('<!DOCTYPE html>') || 
         response.trim().startsWith('<html');
}

// Helper function to extract data from HTML (for cases where API returns HTML)
export function extractFromHtml(htmlContent: string): any {
  try {
    // Basic extraction - this is a simplified version
    // In a real implementation, you'd use a proper HTML parser
    
    // Look for JSON in script tags
    const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch && scriptMatch[1]) {
      const possibleJson = scriptMatch[1].trim();
      try {
        return JSON.parse(possibleJson);
      } catch (e) {
        // Not valid JSON
      }
    }
    
    // Look for data in a specific div or element with ID
    const dataMatch = htmlContent.match(/<div[^>]*id="apiData"[^>]*>([\s\S]*?)<\/div>/i);
    if (dataMatch && dataMatch[1]) {
      return {
        data: dataMatch[1].trim()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting data from HTML:', error);
    return null;
  }
}

export interface ProductInfo {
  name: string;
  price: string;
  stock: string;
  description: string;
  kioskToken?: string;
  success?: string;
  error?: string;
}

// Normalize product information from API response
export function normalizeProductInfo(data: any): ProductInfo | null {
  if (!isValidRecord(data)) return null;
  
  return {
    name: data.name || data.title || data.productName || '',
    price: data.price || data.productPrice || '0',
    stock: data.stock || data.quantity || data.inventory || '0',
    description: data.description || data.details || '',
    kioskToken: data.kioskToken || data.token || '',
    success: data.success || 'true',
    error: data.error || ''
  };
}

// Use serverless function to fetch product info
export async function fetchProductInfoViaServerless(kioskToken: string, userToken: string) {
  try {
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: { 
        endpoint: 'getStock',
        kioskToken,
        userToken
      }
    });
    
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No data returned from API');
    
    return data;
  } catch (error) {
    console.error('Error fetching product info via serverless:', error);
    throw error;
  }
}

export interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
  kioskToken?: string;
  error?: string;
}

// Convert ProductInfo to ApiResponse
export function productInfoToApiResponse(info: ProductInfo): ApiResponse {
  return {
    success: info.success || 'true',
    name: info.name,
    price: info.price,
    stock: info.stock,
    description: info.description,
    kioskToken: info.kioskToken,
    error: info.error
  };
}
