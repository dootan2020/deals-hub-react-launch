
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
    // Extract request body or query parameters
    let params;
    const url = new URL(req.url);
    
    if (req.method === 'POST') {
      const body = await req.json();
      params = body;
    } else {
      params = Object.fromEntries(url.searchParams);
    }
    
    const endpoint = params.endpoint || 'getStock';
    const kioskToken = params.kioskToken;
    const userToken = params.userToken;
    const forceMock = params.forceMock === true || params.forceMock === 'true';
    
    console.log(`API proxy request: ${endpoint}, kioskToken: ${kioskToken?.substring(0, 8)}..., forceMock: ${forceMock}`);

    // Validate required parameters
    if (!kioskToken || !userToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: kioskToken and userToken are required',
          success: 'false'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Mock data for testing when requested or when API fails
    const mockData = {
      success: "true",
      name: "Gmail USA 2023-2024",
      price: "16000",
      stock: "3276"
    };

    // Return mock data if forced
    if (forceMock) {
      console.log("Returning forced mock data");
      return new Response(
        JSON.stringify(mockData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the API URL
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}`;
    
    try {
      console.log(`Fetching from: ${apiUrl}`);
      
      // Make the request directly from the edge function
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      // Log the response status
      console.log(`Response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log(`Response length: ${responseText.length} bytes`);
      
      // Check if response is HTML
      if (responseText.includes('<!DOCTYPE') || 
          responseText.includes('<html') || 
          responseText.includes('<body')) {
        console.log("Received HTML response, returning mock data");
        return new Response(
          JSON.stringify({
            ...mockData,
            fromHtml: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Try to parse as JSON
      try {
        const jsonData = JSON.parse(responseText);
        console.log("Successfully parsed JSON response");
        return new Response(
          JSON.stringify(jsonData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return new Response(
          JSON.stringify({
            ...mockData,
            parseError: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({
          ...mockData,
          error: fetchError.message,
          fetchError: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ 
        success: "false",
        error: `Server error: ${error.message}`,
        name: "Gmail USA 2023-2024",
        price: "16000",
        stock: "3276"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
