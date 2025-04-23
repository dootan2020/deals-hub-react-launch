
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
        error: 'Dữ liệu không hợp lệ: userId và productId là bắt buộc' 
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
        error: 'Không tìm thấy sản phẩm' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Check product availability
    if (product.stock < quantity) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Sản phẩm đã hết hàng' 
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
        error: 'Không tìm thấy thông tin người dùng' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    if (userProfile.balance < totalPrice) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Số dư không đủ để thanh toán' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Generate product key (in a real scenario, you'd get this from a key database or API)
    // For now we'll mock it
    const generateProductKey = () => {
      const segments = 3;
      const segmentLength = 3;
      let key = '';
      
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segmentLength; j++) {
          key += String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
        }
        if (i < segments - 1) key += '-';
      }
      
      return key;
    };
    
    const productKey = generateProductKey();

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
        error: 'Không thể tạo đơn hàng' 
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
        error: 'Không thể cập nhật số dư' 
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
        error: 'Không thể cập nhật số lượng sản phẩm' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Return success response with order details and key
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
      error: 'Lỗi hệ thống' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
