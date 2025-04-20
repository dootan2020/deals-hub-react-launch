
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { orderId } = await req.json();
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing order ID' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) {
        return new Response(
          JSON.stringify({ success: false, message: 'Order not found', error: orderError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      // Get order item details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products:product_id(*)')
        .eq('order_id', orderId);
        
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
      }
      
      // Create invoice number with format "INV-YYYYMMDD-XXXXX"
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const randomPart = Math.floor(10000 + Math.random() * 90000); // 5 random digits
      const invoiceNumber = `INV-${datePart}-${randomPart}`;
      
      // Prepare product info for invoice
      const products = orderItems ? orderItems.map(item => ({
        title: item.products?.title || 'Product',
        price: item.price || 0,
        quantity: item.quantity || 1
      })) : [{
        title: 'Product',
        price: order.total_price || 0,
        quantity: order.qty || 1
      }];
      
      // Check if invoice already exists for this order
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
        
      if (existingInvoice) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Invoice already exists', 
            invoice: existingInvoice 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create new invoice with proper type handling
      const invoiceDetails = {
        products,
        recipient: {} // Recipient info can be empty
      };
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          user_id: order.user_id,
          order_id: order.id,
          amount: order.total_price,
          details: invoiceDetails,
          status: 'issued'
        })
        .select()
        .single();
      
      if (invoiceError) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to create invoice', error: invoiceError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, invoice }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, message: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
