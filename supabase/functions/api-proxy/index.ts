
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const kioskToken = url.searchParams.get('kioskToken')
    const userToken = url.searchParams.get('userToken')
    const proxyType = url.searchParams.get('proxyType') || 'allorigins'
    const forceMockData = url.searchParams.get('force') === 'true'

    if (!kioskToken || !userToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          success: 'false',
          mock: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Log the request
    console.log(`API request: kioskToken=${kioskToken}, proxyType=${proxyType}, forceMock=${forceMockData}`)

    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}`
    console.log(`API URL: ${apiUrl}`)
    
    // Define mock data for specific kiosk tokens
    const mockData = {
      "IEB8KZ8SAJQ5616W2M21": {
        success: "true",
        name: "Gmail USA 2023-2024",
        price: "16000",
        stock: "4003",
        description: "Gmail USA với domain @gmail.com, tạo 2023-2024",
        mock: true
      },
      "WK76IVBVK3X0WW9DKZ4R": {
        success: "true",
        name: "Netflix Premium 4K",
        price: "35000",
        stock: "720",
        description: "Netflix Premium 4K Ultra HD, xem được trên 4 thiết bị cùng lúc",
        mock: true
      },
      "DUP32BXSLWAP4847J84B": {
        success: "true",
        name: "V1 INSTAGRAM QUA 282, NO INFO, NO LOGIN IP, TẠO > 10-30 NGÀY",
        price: "3500",
        stock: "8090",
        description: "Tài khoản Instagram đã qua 282, không yêu cầu login IP, tuổi 10-30 ngày",
        mock: true
      },
      "VPMY2EKXSNY5Y3A4A35B": {
        success: "true",
        name: "Digital Deals Hub Premium",
        price: "29999",
        stock: "345",
        description: "Gói Premium dành cho Digital Deals Hub",
        mock: true
      }
    }

    // If force mock data is true, return mock data directly
    if (forceMockData) {
      console.log("Forced mock data requested, returning mock data")
      const mockResponse = mockData[kioskToken] || {
        success: "true",
        name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
        price: Math.floor(Math.random() * 100000).toString(),
        stock: Math.floor(Math.random() * 1000).toString(),
        description: "Dữ liệu mẫu được tạo tự động",
        mock: true,
        fromMockData: true
      }
      
      return new Response(
        JSON.stringify(mockResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Try to fetch data from real API using the specified proxy type
    let proxyUrl = '';
    let responseData = null;

    try {
      console.log(`Testing with ${proxyType} proxy...`)
      
      // Build proxy URL based on proxyType
      switch(proxyType) {
        case 'allorigins':
          proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
          break;
        case 'corsproxy':
          proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
          break;
        case 'cors-anywhere':
          proxyUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
          break;
        case 'direct':
          proxyUrl = apiUrl;
          break;
        default:
          proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
      }
      
      console.log(`Proxy URL: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      const responseText = await response.text();
      console.log(`Received ${responseText.length} bytes of data`);
      
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.log('Response is HTML, falling back to mock data');
        responseData = mockData[kioskToken] || {
          success: "true",
          name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
          price: Math.floor(Math.random() * 100000).toString(),
          stock: Math.floor(Math.random() * 1000).toString(),
          description: "Dữ liệu mẫu được tạo tự động",
          mock: true,
          fromHtml: true
        };
      } else if (proxyType === 'allorigins' && responseText.includes('"contents"')) {
        try {
          const allOriginsData = JSON.parse(responseText);
          if (allOriginsData && allOriginsData.contents) {
            // Check if the contents is HTML
            if (allOriginsData.contents.includes('<!DOCTYPE') || 
                allOriginsData.contents.includes('<html')) {
              console.log('AllOrigins contents is HTML, falling back to mock data');
              responseData = mockData[kioskToken] || {
                success: "true",
                name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
                price: Math.floor(Math.random() * 100000).toString(),
                stock: Math.floor(Math.random() * 1000).toString(),
                description: "Dữ liệu mẫu được tạo tự động",
                mock: true,
                fromHtml: true
              };
            } else {
              try {
                responseData = JSON.parse(allOriginsData.contents);
                console.log('Successfully retrieved and parsed data from AllOrigins');
              } catch (parseError) {
                console.error('Error parsing AllOrigins contents:', parseError);
                responseData = mockData[kioskToken] || {
                  success: "true",
                  name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
                  price: Math.floor(Math.random() * 100000).toString(),
                  stock: Math.floor(Math.random() * 1000).toString(),
                  description: "Dữ liệu mẫu được tạo tự động",
                  mock: true,
                  parseError: true
                };
              }
            }
          }
        } catch (error) {
          console.error('Error parsing AllOrigins response:', error);
          responseData = mockData[kioskToken] || {
            success: "true",
            name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
            price: Math.floor(Math.random() * 100000).toString(),
            stock: Math.floor(Math.random() * 1000).toString(),
            description: "Dữ liệu mẫu được tạo tự động",
            mock: true,
            allOriginsError: true
          };
        }
      } else {
        try {
          responseData = JSON.parse(responseText);
          console.log('Successfully parsed direct API response');
        } catch (error) {
          console.error('Error parsing JSON:', error);
          responseData = mockData[kioskToken] || {
            success: "true",
            name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
            price: Math.floor(Math.random() * 100000).toString(),
            stock: Math.floor(Math.random() * 1000).toString(),
            description: "Dữ liệu mẫu được tạo tự động",
            mock: true,
            parseError: true
          };
        }
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      responseData = mockData[kioskToken] || {
        success: "true",
        name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
        price: Math.floor(Math.random() * 100000).toString(),
        stock: Math.floor(Math.random() * 1000).toString(),
        description: "Dữ liệu mẫu được tạo tự động",
        mock: true,
        fetchError: true
      };
    }
    
    if (!responseData) {
      responseData = mockData[kioskToken] || {
        success: "true",
        name: `Sản phẩm ${kioskToken.substring(0, 6)}`,
        price: Math.floor(Math.random() * 100000).toString(),
        stock: Math.floor(Math.random() * 1000).toString(),
        description: "Dữ liệu mẫu được tạo tự động",
        mock: true,
        noData: true
      };
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in API proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        success: 'false',
        mock: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
