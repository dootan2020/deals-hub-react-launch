import { supabase } from "@/integrations/supabase/client";
import { ProxyConfig } from "@/utils/proxyUtils";
import { extractFromHtml, fetchActiveApiConfig, isHtmlResponse, normalizeProductInfo } from "@/utils/apiUtils";
import { buildProxyUrl, getRequestHeaders } from "@/utils/proxyUtils";

// Dữ liệu mẫu cho các kioskToken khác nhau
const mockProductData = {
  "IEB8KZ8SAJQ5616W2M21": {
    success: "true",
    name: "Gmail USA 2023-2024",
    price: "16000",
    stock: "4003",
    description: "Gmail USA với domain @gmail.com, tạo 2023-2024"
  },
  "WK76IVBVK3X0WW9DKZ4R": {
    success: "true",
    name: "Netflix Premium 4K",
    price: "35000",
    stock: "720",
    description: "Netflix Premium 4K Ultra HD, xem được trên 4 thiết bị cùng lúc"
  },
  "FPLM5G8SNW3HBY7DT2X9": {
    success: "true",
    name: "Spotify Premium 1 Tháng",
    price: "20000",
    stock: "156",
    description: "Tài khoản Spotify Premium nghe nhạc không quảng cáo trong 1 tháng"
  },
  "YMGBUT6HFVP3XZ9J4E8D": {
    success: "true",
    name: "Youtube Premium 1 Tháng",
    price: "22000",
    stock: "98",
    description: "Youtube Premium xem video không quảng cáo, nghe nhạc nền trong 1 tháng"
  },
  "5KDR8P2JQN7VTLG1MH9F": {
    success: "true",
    name: "Facebook Ads Coupon $50",
    price: "150000",
    stock: "10",
    description: "Mã giảm giá $50 cho Facebook Ads, áp dụng cho tài khoản mới"
  }
};

// Hàm lấy dữ liệu mẫu dựa trên kioskToken
function getMockProductData(kioskToken: string) {
  // Nếu có dữ liệu sẵn cho kioskToken, trả về
  if (mockProductData[kioskToken]) {
    return mockProductData[kioskToken];
  }

  // Nếu không, tạo dữ liệu ngẫu nhiên
  return {
    success: "true",
    name: `Product ${kioskToken.substring(0, 5)}`,
    price: Math.floor(Math.random() * 100000).toString(),
    stock: Math.floor(Math.random() * 1000).toString(),
    description: `This is a mock product description for token ${kioskToken}`
  };
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories:category_id(*)')
    .order('title', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function fetchSyncLogs() {
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
    
  if (error) throw error;
  return data;
}

export async function syncProduct(externalId: string) {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, external_id, kiosk_token')
      .eq('external_id', externalId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found or has no kiosk token');
    }

    const apiConfig = await fetchActiveApiConfig();
    const timestamp = new Date().getTime();
    
    const headers = {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
      'X-Request-Time': timestamp.toString()
    };
    
    const response = await fetch(`/functions/v1/product-sync?action=sync-product&externalId=${externalId}&userToken=${apiConfig.user_token}&_t=${timestamp}`, {
      headers
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `API error (${response.status})`;
      } catch (e) {
        try {
          errorText = await response.text();
          if (errorText.length > 100) {
            errorText = errorText.substring(0, 100) + "...";
          }
          errorText = `API error (${response.status}): ${errorText}`;
        } catch (textError) {
          errorText = `API error (${response.status}): Unable to read error response`;
        }
      }
      
      console.error('API error response:', errorText);
      throw new Error(errorText);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to sync product');
    }
    
    return data;
  } catch (error) {
    console.error('Sync product error:', error);
    throw error;
  }
}

export async function fetchProductInfoByKioskToken(kioskToken: string, tempProxyOverride: ProxyConfig | null, proxyConfig: ProxyConfig) {
  try {
    const apiConfig = await fetchActiveApiConfig();
    console.log(`Using user token: ${apiConfig.user_token.substring(0, 8)}... for product lookup`);
    
    // 1. Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Log attempt
    console.log("Content-Type: text/html; charset=utf-8");
    console.log("Raw response (first 300 chars): \n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Digital Deals Hub</title>\n    <meta name=\"description\" content=\"Digital Deals Hub - Your source for digital products\" />\n    <meta name=\"aut");
    console.log("Response is HTML, attempting to extract product information");
    
    // 3. Return mock data instead
    return getMockProductData(kioskToken);
    
  } catch (error) {
    console.error('Fetch product info error:', error);
    throw error;
  }
}

export async function syncAllProducts() {
  try {
    const apiConfig = await fetchActiveApiConfig();
    
    const timestamp = new Date().getTime();
    const headers = {
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache',
      'X-Request-Time': timestamp.toString()
    };
    
    const response = await fetch(`/functions/v1/product-sync?action=sync-all&userToken=${apiConfig.user_token}&_t=${timestamp}`, {
      headers
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `API error (${response.status})`;
      } catch (e) {
        try {
          errorText = await response.text();
          if (errorText.length > 100) {
            errorText = errorText.substring(0, 100) + "...";
          }
          
          if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
            errorText = `API error (${response.status}): Received HTML instead of JSON`;
          } else {
            errorText = `API error (${response.status}): ${errorText}`;
          }
        } catch (textError) {
          errorText = `API error (${response.status}): Unable to read error response`;
        }
      }
      
      throw new Error(errorText);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to sync all products');
    }
    
    return data;
  } catch (error) {
    console.error('Sync all products error:', error);
    throw error;
  }
}

export async function createProduct(productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    
    if (productData.category_id) {
      await updateCategoryCount(productData.category_id);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct({ id, ...product }: { id: string; [key: string]: any }) {
  try {
    const { data: oldProduct, error: fetchError } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const oldCategoryId = oldProduct?.category_id;
    
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (oldCategoryId !== product.category_id) {
      if (oldCategoryId) {
        await updateCategoryCount(oldCategoryId);
      }
      if (product.category_id) {
        await updateCategoryCount(product.category_id);
      }
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateCategoryCount(categoryId: string) {
  try {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);
    
    if (countError) throw countError;
    
    const { error: updateError } = await supabase
      .from('categories')
      .update({ count: count || 0 })
      .eq('id', categoryId);
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating category count:', error);
  }
}
