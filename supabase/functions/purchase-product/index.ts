
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const { userId, productId, quantity = 1 } = await req.json()

    // Validate input
    if (!userId || !productId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid input: userId and productId are required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Product not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Check product availability
    if (product.stock < quantity) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Insufficient stock' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Calculate total price
    const totalPrice = product.price * quantity

    // Check user balance
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User profile not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    if (userProfile.balance < totalPrice) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Insufficient balance' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Simulate getting product key (replace with actual key retrieval logic)
    const productKey = `KEY-${Math.random().toString(36).substring(7)}`

    // Create order transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        product_id: productId,
        total_price: totalPrice,
        qty: quantity,
        status: 'completed',
        keys: [{ key: productKey }]
      })
      .select()
      .single()

    if (orderError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to create order' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Update user balance
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      user_id_param: userId,
      amount_param: -totalPrice
    })

    if (balanceError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to update balance' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Update product stock
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: product.stock - quantity })
      .eq('id', productId)

    if (stockError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to update product stock' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Return success response with order details
    return new Response(JSON.stringify({ 
      success: true, 
      orderId: order.id, 
      key: productKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Purchase Error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
