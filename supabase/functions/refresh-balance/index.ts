
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the request body
    const requestData = await req.json()
    const { user_id, action } = requestData

    if (!user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User ID is required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (action === 'calculate') {
      // Calculate the balance based on transactions
      const { data, error } = await supabase.rpc('calculate_user_balance_from_transactions', {
        user_id_param: user_id
      })

      if (error) {
        console.error('Error calculating balance:', error)
        return new Response(
          JSON.stringify({ 
            success: false,
            message: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          balance: data
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    } else if (action === 'reconcile') {
      // Get current balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user_id)
        .single()

      if (profileError) {
        console.error('Error retrieving current balance:', profileError)
        return new Response(
          JSON.stringify({
            success: false,
            message: profileError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }

      const currentBalance = profileData.balance

      // Calculate the correct balance
      const { data: calculatedBalance, error: calcError } = await supabase.rpc(
        'calculate_user_balance_from_transactions',
        {
          user_id_param: user_id
        }
      )

      if (calcError) {
        console.error('Error calculating balance:', calcError)
        return new Response(
          JSON.stringify({
            success: false,
            message: calcError.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }

      const difference = Number(calculatedBalance) - Number(currentBalance)

      // If there's a difference, update the balance
      if (Math.abs(difference) > 0.01) {
        // Update the balance
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ balance: calculatedBalance })
          .eq('id', user_id)

        if (updateError) {
          console.error('Error updating balance:', updateError)
          return new Response(
            JSON.stringify({
              success: false,
              message: updateError.message
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            oldBalance: currentBalance,
            newBalance: calculatedBalance,
            difference
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      } else {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Balance is already correct',
            balance: currentBalance,
            calculatedBalance
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }
    }

    // Invalid action
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid action'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  } catch (error) {
    console.error('Error in refresh-balance:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
