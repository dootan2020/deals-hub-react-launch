
import { supabase } from "@/integrations/supabase/client";

export async function fetchActiveApiConfig() {
  const { data: apiConfig, error: configError } = await supabase
    .from('api_configs')
    .select('user_token')
    .eq('is_active', true)
    .order('created_at', { ascending: Math.random() > 0.5 })
    .limit(1)
    .single();
    
  if (configError || !apiConfig) {
    throw new Error('No active API configuration found');
  }

  console.log(`Using user token: ${apiConfig.user_token.substring(0, 8)}... for API request`);
  return apiConfig;
}

export function extractFromHtml(html: string) {
  try {
    const nameMatch = html.match(/<title>(.*?)<\/title>/i);
    const name = nameMatch ? nameMatch[1].replace(" - TapHoaMMO", "").trim() : null;
    
    let price = null;
    const priceMatch = html.match(/(\d+(\.\d+)?)\s*USD/i) || html.match(/\$\s*(\d+(\.\d+)?)/i);
    if (priceMatch) {
      price = priceMatch[1];
    }
    
    let inStock = true;
    if (html.includes("Out of stock") || html.includes("Hết hàng")) {
      inStock = false;
    }
    
    if (name || price) {
      return {
        success: "true",
        name: name || "Information extracted from HTML",
        price: price || "0",
        stock: inStock ? "1" : "0",
        description: "Information extracted from HTML response"
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return null;
  }
}

// New function to determine if a response is HTML content
export function isHtmlResponse(response: string): boolean {
  return response.includes('<!DOCTYPE') || 
         response.includes('<html') || 
         response.includes('<body') ||
         response.includes('<head');
}

// New function to clean up and format JSON data
export function normalizeProductInfo(data: any) {
  if (!data) return null;
  
  return {
    success: data.success || 'false',
    name: data.name || '',
    price: data.price || '0',
    stock: data.stock || '0',
    description: data.description || `${data.name || 'Product'} description`
  };
}
