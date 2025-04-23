
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
    const { userId, productId, quantity = 1, promotionCode } = await req.json()

    // Get the API user token from environment variable
    const userToken = Deno.env.get('TAPHOAMMO_USER_TOKEN')
    if (!userToken) {
      console.error('TAPHOAMMO_USER_TOKEN is not configured')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API configuration missing' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

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
      .select('id, title, price, stock, kiosk_token')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      console.error('Product fetch error:', productError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Không tìm thấy sản phẩm' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Check if product has kiosk_token
    if (!product.kiosk_token) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Sản phẩm không có token mua hàng' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Check product availability in local database
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
      console.error('User profile fetch error:', profileError)
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

    // STEP 1: Call taphoammo API to buy product
    console.log(`Calling buyProducts API with kioskToken=${product.kiosk_token}, quantity=${quantity}`)
    
    const buyUrl = new URL('https://taphoammo.net/api/buyProducts')
    buyUrl.searchParams.append('kioskToken', product.kiosk_token)
    buyUrl.searchParams.append('userToken', userToken)
    buyUrl.searchParams.append('quantity', quantity.toString())
    
    if (promotionCode) {
      buyUrl.searchParams.append('promotion', promotionCode)
    }

    const buyResponse = await fetch(buyUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!buyResponse.ok) {
      console.error('Buy API error:', await buyResponse.text())
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lỗi khi gọi API mua hàng' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const buyData = await buyResponse.json()
    
    if (!buyData.success || !buyData.data || !buyData.data.orderId) {
      console.error('Buy API returned error:', buyData)
      return new Response(JSON.stringify({ 
        success: false, 
        error: buyData.message || 'API mua hàng không trả về orderId' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const orderId = buyData.data.orderId

    // STEP 2: Call getProducts API to retrieve the purchased keys
    console.log(`Calling getProducts API with orderId=${orderId}`)
    
    const getUrl = new URL('https://taphoammo.net/api/getProducts')
    getUrl.searchParams.append('orderId', orderId)
    getUrl.searchParams.append('userToken', userToken)

    const getResponse = await fetch(getUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!getResponse.ok) {
      console.error('Get Products API error:', await getResponse.text())
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Lỗi khi lấy sản phẩm đã mua' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const getData = await getResponse.json()
    
    if (!getData.success || !getData.data || !getData.data.products) {
      console.error('Get Products API returned error:', getData)
      return new Response(JSON.stringify({ 
        success: false, 
        error: getData.message || 'API không trả về sản phẩm' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Process the returned products (keys)
    const productKeys = getData.data.products
    
    // Join multiple keys into a newline-separated string if there are multiple
    const keyDelivered = Array.isArray(productKeys) ? productKeys.join('\n') : productKeys

    // Create order transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        product_id: productId,
        total_price: totalPrice,
        qty: quantity,
        status: 'completed',
        keys: [{ key: keyDelivered }],
        external_order_id: orderId
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
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
      console.error('Balance update error:', balanceError)
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
      console.error('Stock update error:', stockError)
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
      externalOrderId: orderId,
      key: keyDelivered 
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
