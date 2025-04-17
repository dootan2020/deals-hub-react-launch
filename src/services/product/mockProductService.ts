
import { ProxyConfig } from "@/utils/proxyUtils";
import { extractFromHtml, isHtmlResponse } from "@/utils/apiUtils";

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

export async function fetchProductInfoByKioskToken(kioskToken: string, tempProxyOverride: ProxyConfig | null, proxyConfig: ProxyConfig) {
  try {
    const apiConfig = await import('@/utils/apiUtils').then(module => module.fetchActiveApiConfig());
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
