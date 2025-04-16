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
    // Tìm tên sản phẩm
    let name = null;
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].replace(" - TapHoaMMO", "").trim();
    } else {
      // Tìm trong các thẻ h1, h2
      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (h1Match) name = h1Match[1].trim();
      else if (h2Match) name = h2Match[1].trim();
    }
    
    // Tìm giá
    let price = null;
    // Tìm các pattern giá phổ biến
    const pricePatterns = [
      /(\d+(\.\d+)?)\s*USD/i,
      /\$\s*(\d+(\.\d+)?)/i,
      /Price:\s*\$?\s*(\d+(\.\d+)?)/i,
      /(\d+(\.\d+)?)\s*\$/i,
      /(\d+)[,.](\d{3})/
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        price = match[1].replace(/,/g, '');
        break;
      }
    }
    
    // Tìm tình trạng tồn kho
    let inStock = true;
    const outOfStockPatterns = [
      /out of stock/i,
      /hết hàng/i,
      /sold out/i,
      /unavailable/i,
      /<div[^>]*class="[^"]*out-of-stock[^"]*"[^>]*>/i
    ];
    
    for (const pattern of outOfStockPatterns) {
      if (pattern.test(html)) {
        inStock = false;
        break;
      }
    }
    
    // Tìm số lượng tồn kho
    let stock = "0";
    if (inStock) {
      const stockPatterns = [
        /in stock:\s*(\d+)/i,
        /còn hàng:\s*(\d+)/i,
        /quantity:\s*(\d+)/i,
        /available:\s*(\d+)/i
      ];
      
      for (const pattern of stockPatterns) {
        const match = html.match(pattern);
        if (match) {
          stock = match[1];
          break;
        }
      }
      
      if (stock === "0" && inStock) {
        stock = "1"; // Mặc định là 1 nếu còn hàng nhưng không tìm thấy số lượng
      }
    }
    
    if (name || price) {
      return {
        success: "true",
        name: name || "Product from TapHoaMMO",
        price: price || "0",
        stock: stock,
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
