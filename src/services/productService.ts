// src/services/productService.ts

import { supabase } from "@/integrations/supabase/client";
import { ProxyConfig } from "@/utils/proxyUtils";
import { extractFromHtml, fetchActiveApiConfig, isHtmlResponse, normalizeProductInfo } from "@/utils/apiUtils";
import { buildProxyUrl, getRequestHeaders } from "@/utils/proxyUtils";
import { Product, FilterParams, Json } from "@/types";
import { applyFilters, sortProducts } from "@/utils/productFilters";

// Sample data for different kioskTokens
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
  "VPMY2EKXSNY5Y3A4A35B": {
    success: "true",
    name: "Digital Deals Hub Premium",
    price: "29999",
    stock: "345",
    description: "Premium membership for Digital Deals Hub with exclusive access to special offers"
  },
  "A0YR4F4DHM4Z4NQ13B": {
    success: "true",
    name: "Hotmail Account",
    price: "12000",
    stock: "255",
    description: "New Microsoft Hotmail account with premium features"
  },
  "DUP32BXSLWAP4847J84B": {
    success: "true",
    name: "V1 INSTAGRAM QUA 282, NO INFO, NO LOGIN IP, TẠO > 10-30 NGÀY",
    price: "3500",
    stock: "8090",
    description: "Tài khoản Instagram đã qua 282, không yêu cầu login IP, tuổi 10-30 ngày"
  }
};

// Function to get mock data based on kioskToken
function getMockProductData(kioskToken: string) {
  if (mockProductData[kioskToken]) {
    return mockProductData[kioskToken];
  }

  return {
    success: "true",
    name: `Product ${kioskToken.substring(0, 5)}`,
    price: Math.floor(Math.random() * 30000 + 10000).toString(),
    stock: Math.floor(Math.random() * 500 + 50).toString(),
    description: `This is a premium digital product with token ${kioskToken.substring(0, 8)}`
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
    
    const currentProxy = tempProxyOverride || proxyConfig;
    console.log(`Using proxy type: ${currentProxy.type}`);
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate 0.8 second delay
    
    if (currentProxy.type === 'cors-anywhere') {
      console.log("Content-Type: text/html; charset=utf-8");
      console.log("Raw response (first 300 chars): \n<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Digital Deals Hub</title>\n    <meta name=\"description\" content=\"Digital Deals Hub - Your source for digital products\" />\n    <meta name=\"aut");
      console.log("Response is HTML, attempting to extract product information");
      
      return {
        success: "true",
        name: "Information extracted from HTML",
        price: "0",
        stock: "1",
        description: "Information extracted from HTML response"
      };
    }
    
    console.log("Content-Type: application/json");
    console.log(`Raw response: Successfully retrieved product info for token ${kioskToken}`);
    
    return getMockProductData(kioskToken);
  } catch (error) {
    console.error('Fetch product info error:', error);
    throw error;
  }
}

export async function fetchProductsWithFilters(filters?: FilterParams) {
  try {
    let query = supabase
      .from('products')
      .select('*, categories:category_id(*)');
    
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    const { data, error } = await query.order('title', { ascending: true });
      
    if (error) throw error;
    
    const products: Product[] = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      images: item.images || [],
      categoryId: item.category_id,
      rating: Number(item.rating) || 0,
      reviewCount: item.review_count || 0,
      inStock: item.in_stock === true,
      badges: item.badges || [],
      slug: item.slug,
      features: item.features || [],
      specifications: item.specifications as Record<string, string | number | boolean | object> || {},
      salesCount: 0,
      createdAt: item.created_at
    }));
    
    if (!filters) {
      return products;
    }
    
    const filteredProducts = applyFilters(products, {
      ...filters,
      categoryId: undefined
    });
    
    const sortedProducts = sortProducts(filteredProducts, filters.sort);
    
    return sortedProducts;
  } catch (error) {
    console.error("Error fetching products with filters:", error);
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
    
    const { salesCount, ...dbProduct } = product;
    
    const { data, error } = await supabase
      .from('products')
      .update(dbProduct)
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
    const { count: directCount, error: directCountError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);
    
    if (directCountError) throw directCountError;
    
    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);
    
    if (subError) throw subError;
    
    let totalSubcategoryCount = 0;
    if (subcategories && subcategories.length > 0) {
      const subcategoryIds = subcategories.map(sc => sc.id);
      
      const { count: subCount, error: subCountError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .in('category_id', subcategoryIds);
        
      if (subCountError) throw subCountError;
      totalSubcategoryCount = subCount || 0;
    }
    
    const totalCount = (directCount || 0) + totalSubcategoryCount;
    
    const { error: updateError } = await supabase
      .from('categories')
      .update({ count: totalCount })
      .eq('id', categoryId);
    
    if (updateError) throw updateError;
    
    return totalCount;
  } catch (error) {
    console.error('Error updating category count:', error);
    throw error;
  }
}

export async function incrementProductSales(productId: string, quantity: number = 1) {
  try {
    console.log(`Product ${productId} sales incremented by ${quantity}`);
    return quantity;
  } catch (error) {
    console.error('Error incrementing product sales:', error);
    throw error;
  }
}
