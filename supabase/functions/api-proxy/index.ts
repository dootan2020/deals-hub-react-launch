
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
    const apiEndpoint = url.searchParams.get('endpoint') || 'getStock'
    const kioskToken = url.searchParams.get('kioskToken')
    const userToken = url.searchParams.get('userToken')
    const quantity = url.searchParams.get('quantity')
    const promotionCode = url.searchParams.get('promotion')
    const orderId = url.searchParams.get('orderId')
    const proxyType = url.searchParams.get('proxyType') || 'allorigins'
    const forceMockData = url.searchParams.get('force') === 'true'

    // Validate required parameters based on API endpoint
    if (apiEndpoint === 'getStock' && (!kioskToken || !userToken)) {
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
    
    if (apiEndpoint === 'buyProducts' && (!kioskToken || !userToken || !quantity)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters for buyProducts',
          success: 'false',
          mock: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }
    
    if (apiEndpoint === 'getProducts' && (!orderId || !userToken)) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters for getProducts',
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
    console.log(`API request: endpoint=${apiEndpoint}, proxyType=${proxyType}, forceMock=${forceMockData}`)

    // Construct the appropriate API URL based on endpoint
    let apiUrl = '';
    
    switch(apiEndpoint) {
      case 'getStock':
        apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken!)}&userToken=${encodeURIComponent(userToken!)}`;
        break;
      case 'buyProducts':
        apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${encodeURIComponent(kioskToken!)}&userToken=${encodeURIComponent(userToken!)}&quantity=${quantity}`;
        if (promotionCode) {
          apiUrl += `&promotion=${encodeURIComponent(promotionCode)}`;
        }
        break;
      case 'getProducts':
        apiUrl = `https://taphoammo.net/api/getProducts?orderId=${encodeURIComponent(orderId!)}&userToken=${encodeURIComponent(userToken!)}`;
        break;
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API endpoint',
            success: 'false',
            mock: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
    }
    
    console.log(`API URL: ${apiUrl}`)
    
    // Define mock data for specific kiosk tokens or endpoints
    const mockData = {
      getStock: {
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
        "default": {
          success: "true",
          name: "Digital Product",
          price: Math.floor(Math.random() * 100000).toString(),
          stock: Math.floor(Math.random() * 1000).toString(),
          description: "Mock digital product data",
          mock: true
        }
      },
      buyProducts: {
        success: "true",
        order_id: `MOCK${Math.floor(Math.random() * 1000000)}`,
        mock: true
      },
      getProducts: {
        success: "true",
        data: [
          {
            product: "Gmail USA 2023-2024",
            account: "example@gmail.com",
            password: "MockPassword123",
            notes: "Password will be reset after 30 days"
          },
          {
            product: "Login information",
            url: "https://accounts.google.com",
            date: new Date().toISOString().split('T')[0]
          }
        ],
        mock: true
      },
      getProductsProcessing: {
        success: "false",
        description: "Order in processing!",
        mock: true
      }
    }

    // If force mock data is true, return mock data directly
    if (forceMockData) {
      console.log("Forced mock data requested, returning mock data")
      
      let mockResponse;
      
      switch(apiEndpoint) {
        case 'getStock':
          mockResponse = mockData.getStock[kioskToken!] || mockData.getStock.default;
          break;
        case 'buyProducts':
          mockResponse = mockData.buyProducts;
          break;
        case 'getProducts':
          // 30% chance of returning "still processing" response for testing
          mockResponse = Math.random() < 0.3 
            ? mockData.getProductsProcessing 
            : mockData.getProducts;
          break;
        default:
          mockResponse = { 
            success: "false", 
            description: "Invalid endpoint", 
            mock: true 
          };
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

      // Improved handling of AllOrigins response
      if (proxyType === 'allorigins') {
        try {
          const allOriginsData = JSON.parse(responseText);
          if (allOriginsData && allOriginsData.contents) {
            // Check if the contents is HTML
            if (allOriginsData.contents.includes('<!DOCTYPE') || 
                allOriginsData.contents.includes('<html')) {
              console.log('AllOrigins contents is HTML, falling back to mock data');
              
              // Use endpoint-specific mock data
              switch(apiEndpoint) {
                case 'getStock':
                  responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
                  break;
                case 'buyProducts':
                  responseData = mockData.buyProducts;
                  break;
                case 'getProducts':
                  responseData = mockData.getProducts;
                  break;
                default:
                  responseData = { 
                    success: "false", 
                    description: "Invalid endpoint", 
                    mock: true 
                  };
              }
              
              responseData.fromHtml = true;
            } else {
              try {
                // Try to parse the contents as JSON
                responseData = JSON.parse(allOriginsData.contents);
                console.log('Successfully retrieved and parsed data from AllOrigins');
              } catch (parseError) {
                console.error('Error parsing AllOrigins contents:', parseError);
                
                // Use endpoint-specific mock data on parse error
                switch(apiEndpoint) {
                  case 'getStock':
                    responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
                    break;
                  case 'buyProducts':
                    responseData = mockData.buyProducts;
                    break;
                  case 'getProducts':
                    responseData = mockData.getProducts;
                    break;
                  default:
                    responseData = { 
                      success: "false", 
                      description: "Invalid endpoint", 
                      mock: true 
                    };
                }
                
                responseData.parseError = true;
              }
            }
          } else {
            throw new Error('Invalid AllOrigins response format');
          }
        } catch (error) {
          console.error('Error parsing AllOrigins response:', error);
          
          // Use endpoint-specific mock data on AllOrigins error
          switch(apiEndpoint) {
            case 'getStock':
              responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
              break;
            case 'buyProducts':
              responseData = mockData.buyProducts;
              break;
            case 'getProducts':
              responseData = mockData.getProducts;
              break;
            default:
              responseData = { 
                success: "false", 
                description: "Invalid endpoint", 
                mock: true 
              };
          }
          
          responseData.allOriginsError = true;
        }
      } else if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.log('Response is HTML, falling back to mock data');
        
        // Use endpoint-specific mock data when HTML response received
        switch(apiEndpoint) {
          case 'getStock':
            responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
            break;
          case 'buyProducts':
            responseData = mockData.buyProducts;
            break;
          case 'getProducts':
            responseData = mockData.getProducts;
            break;
          default:
            responseData = { 
              success: "false", 
              description: "Invalid endpoint", 
              mock: true 
            };
        }
        
        responseData.fromHtml = true;
      } else {
        try {
          responseData = JSON.parse(responseText);
          console.log('Successfully parsed direct API response');
        } catch (error) {
          console.error('Error parsing JSON:', error);
          
          // Use endpoint-specific mock data on parse error
          switch(apiEndpoint) {
            case 'getStock':
              responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
              break;
            case 'buyProducts':
              responseData = mockData.buyProducts;
              break;
            case 'getProducts':
              responseData = mockData.getProducts;
              break;
            default:
              responseData = { 
                success: "false", 
                description: "Invalid endpoint", 
                mock: true 
              };
          }
          
          responseData.parseError = true;
        }
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      // Use endpoint-specific mock data on fetch error
      switch(apiEndpoint) {
        case 'getStock':
          responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
          break;
        case 'buyProducts':
          responseData = mockData.buyProducts;
          break;
        case 'getProducts':
          responseData = mockData.getProducts;
          break;
        default:
          responseData = { 
            success: "false", 
            description: "Invalid endpoint", 
            mock: true 
          };
      }
      
      responseData.fetchError = true;
    }
    
    if (!responseData) {
      // Default mock data if no response
      switch(apiEndpoint) {
        case 'getStock':
          responseData = mockData.getStock[kioskToken!] || mockData.getStock.default;
          break;
        case 'buyProducts':
          responseData = mockData.buyProducts;
          break;
        case 'getProducts':
          responseData = mockData.getProducts;
          break;
        default:
          responseData = { 
            success: "false", 
            description: "Invalid endpoint", 
            mock: true 
          };
      }
      
      responseData.noData = true;
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
