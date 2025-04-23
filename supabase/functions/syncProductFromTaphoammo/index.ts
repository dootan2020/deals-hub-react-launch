
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
}

// Helper function to get products from taphoammo API
const fetchProductFromTaphoammo = async (kioskToken: string, userToken: string) => {
  try {
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}&userToken=${userToken}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching from taphoammo API:', error)
    throw error
  }
}

// Main function to handle the product synchronization
const syncProduct = async (req: Request, supabase: any) => {
  try {
    // Parse the request body
    const { kioskToken, userToken } = await req.json()
    
    // Validate parameters
    if (!kioskToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing kioskToken parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Fetch the product details from taphoammo
    const apiResponse = await fetchProductFromTaphoammo(kioskToken, userToken)
    console.log('API Response:', apiResponse)
    
    if (!apiResponse.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: apiResponse.message || 'Failed to fetch product from taphoammo' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Find the product in database using kiosk_token
    const { data: existingProduct, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('kiosk_token', kioskToken)
      .single()
    
    if (findError || !existingProduct) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Product with this kiosk_token not found in database' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    
    // Extract relevant data from API response
    const productData = apiResponse.data
    
    // Update the product in the database
    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: productData.name || productData.title,
        price: productData.price,
        stock: productData.stock,
        api_price: productData.price,
        api_stock: productData.stock,
        api_name: productData.name || productData.title,
        last_synced_at: new Date().toISOString()
      })
      .eq('kiosk_token', kioskToken)
    
    if (updateError) {
      console.error('Error updating product:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update product in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Log the successful sync
    await supabase
      .from('sync_logs')
      .insert({
        action: 'sync_product',
        product_id: existingProduct.id,
        status: 'success',
        message: 'Product synchronized from taphoammo'
      })
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Product synchronized successfully',
        data: {
          name: productData.name || productData.title,
          price: productData.price,
          stock: productData.stock
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in syncProduct:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Create Supabase client
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://xcpwyvrlutlslgaueokd.supabase.co'
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0'
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  })

  return await syncProduct(req, supabase)
})
