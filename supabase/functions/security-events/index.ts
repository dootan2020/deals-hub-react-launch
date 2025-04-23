
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEvent {
  type: 'login' | 'purchase'
  user_id?: string
  email?: string
  ip_address: string
  user_agent: string
  success: boolean
  metadata?: Record<string, any>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { event }: { event: SecurityEvent } = await req.json()

    // Validate required fields
    if (!event.type || !event.ip_address || !event.user_agent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate that either user_id or email is provided
    if (!event.user_id && !event.email) {
      return new Response(
        JSON.stringify({ error: 'Either user_id or email must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert security event
    const { data, error } = await supabaseClient
      .from('security_events')
      .insert([{
        type: event.type,
        user_id: event.user_id,
        email: event.email,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        success: event.success,
        metadata: event.metadata || {}
      }])
      .select()
      .single()

    if (error) throw error

    // If event was unsuccessful, create security alert
    if (!event.success) {
      const alertDetails = `Failed ${event.type} attempt from IP ${event.ip_address}`
      await supabaseClient
        .from('security_alerts')
        .insert([{
          user_id: event.user_id,
          alert_type: `failed_${event.type}`,
          details: alertDetails,
          status: 'open'
        }])
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
