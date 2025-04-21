
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { action, data } = await req.json();
    
    switch(action) {
      case 'record-login':
        return await recordLogin(supabase, data);
      case 'record-purchase':
        return await recordPurchase(supabase, data);
      case 'check-user-behavior':
        return await checkUserBehavior(supabase, data);
      case 'report-suspicious':
        return await reportSuspiciousActivity(supabase, data);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in fraud-detection function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function recordLogin(supabase: any, data: any) {
  try {
    // Enhance data with geolocation info if IP is available
    if (data.ip_address && data.ip_address !== 'unknown') {
      try {
        const geoData = await getGeolocationData(data.ip_address);
        data.country = geoData.country;
        data.city = geoData.city;
      } catch (error) {
        console.warn('Failed to get geolocation data:', error);
      }
    }
    
    // Record login attempt
    await supabase
      .from('security_events')
      .insert({
        type: 'login',
        user_id: data.user_id,
        email: data.email,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        success: data.success,
        metadata: {
          country: data.country,
          city: data.city,
          timestamp: data.timestamp
        }
      });
    
    // Check for suspicious activity
    const isSuspicious = await detectLoginAnomaly(supabase, data);
    
    return new Response(
      JSON.stringify({ success: true, suspicious: isSuspicious }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error recording login:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function recordPurchase(supabase: any, data: any) {
  try {
    // Record purchase attempt
    await supabase
      .from('security_events')
      .insert({
        type: 'purchase',
        user_id: data.user_id,
        ip_address: data.ip_address,
        metadata: {
          amount: data.amount,
          product_id: data.product_id,
          device_info: data.device_info,
          timestamp: data.timestamp
        }
      });
    
    // Check for suspicious activity
    const isSuspicious = await detectPurchaseAnomaly(supabase, data);
    
    return new Response(
      JSON.stringify({ success: true, suspicious: isSuspicious }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error recording purchase:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function checkUserBehavior(supabase: any, data: any) {
  try {
    const userId = data.user_id;
    
    // This would incorporate machine learning in a production environment
    // For now, we'll use simpler heuristics
    
    // 1. Check for account age - new accounts are riskier
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    const accountAgeInDays = (new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24);
    
    // 2. Check recent failed login attempts
    const { data: failedLogins, error: loginError } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'login')
      .eq('success', false)
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString())
      .order('created_at', { ascending: false });
      
    if (loginError) throw loginError;
    
    // 3. Check location changes
    const { data: recentEvents, error: eventsError } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (eventsError) throw eventsError;
    
    // Analyze the data for anomalies
    let riskScore = 0;
    
    // New account risk
    if (accountAgeInDays < 1) riskScore += 30;
    else if (accountAgeInDays < 7) riskScore += 15;
    
    // Failed login risk
    riskScore += failedLogins.length * 10;
    
    // Location change risk
    const countries = new Set();
    recentEvents.forEach(event => {
      if (event.metadata?.country) {
        countries.add(event.metadata.country);
      }
    });
    
    if (countries.size > 2) riskScore += 20;
    
    // Consider suspicious if risk score is high
    const isSuspicious = riskScore >= 40;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        suspicious: isSuspicious,
        risk_score: riskScore,
        risk_factors: {
          account_age_days: accountAgeInDays,
          failed_logins_24h: failedLogins.length,
          countries: Array.from(countries)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking user behavior:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function reportSuspiciousActivity(supabase: any, data: any) {
  try {
    // Create admin notification
    await supabase
      .from('notifications')
      .insert({
        type: 'warning',
        message: `Suspicious ${data.type} activity detected for user ID: ${data.user_id.substring(0, 8)}...`,
        admin_only: true,
        read: false
      });
    
    // Create security alert
    await supabase
      .from('security_alerts')
      .insert({
        user_id: data.user_id,
        alert_type: `suspicious_${data.type}`,
        details: data.details,
        status: 'open'
      });
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error reporting suspicious activity:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function detectLoginAnomaly(supabase: any, data: any) {
  // Set thresholds
  const MAX_FAILURES_PER_EMAIL = 5;
  const MAX_FAILURES_PER_IP = 10;
  const TIME_WINDOW_HOURS = 24;
  const VELOCITY_CHECK_MINUTES = 10;
  
  try {
    const timeWindow = new Date();
    timeWindow.setHours(timeWindow.getHours() - TIME_WINDOW_HOURS);
    
    // Check failed attempts by email
    const { count: emailFailCount, error: emailError } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'login')
      .eq('email', data.email)
      .eq('success', false)
      .gte('created_at', timeWindow.toISOString());
      
    if (emailError) throw emailError;
    
    // Check failed attempts by IP
    const { count: ipFailCount, error: ipError } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'login')
      .eq('ip_address', data.ip_address)
      .eq('success', false)
      .gte('created_at', timeWindow.toISOString());
      
    if (ipError) throw ipError;
    
    // Check login velocity (attempts in last X minutes)
    const velocityCheckTime = new Date();
    velocityCheckTime.setMinutes(velocityCheckTime.getMinutes() - VELOCITY_CHECK_MINUTES);
    
    const { count: velocityCount, error: velocityError } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'login')
      .eq('email', data.email)
      .gte('created_at', velocityCheckTime.toISOString());
      
    if (velocityError) throw velocityError;
    
    // Anomaly detection logic
    const isSuspicious = 
      emailFailCount >= MAX_FAILURES_PER_EMAIL ||
      ipFailCount >= MAX_FAILURES_PER_IP ||
      velocityCount >= 15; // Too many attempts too quickly
    
    if (isSuspicious) {
      console.log(`Suspicious login detected: email=${data.email}, failedAttempts=${emailFailCount}, ipFailures=${ipFailCount}, velocity=${velocityCount}`);
      
      // If suspicious, record in security_alerts
      await supabase
        .from('security_alerts')
        .insert({
          user_id: data.user_id,
          alert_type: 'suspicious_login',
          details: JSON.stringify({
            email: data.email,
            ip_address: data.ip_address,
            emailFailCount,
            ipFailCount,
            velocityCount
          }),
          status: 'open'
        });
    }
    
    return isSuspicious;
  } catch (error) {
    console.error('Error in login anomaly detection:', error);
    return false; // Fail open to prevent blocking legitimate users on error
  }
}

async function detectPurchaseAnomaly(supabase: any, data: any) {
  // Set thresholds
  const MAX_DAILY_PURCHASES = 15;
  const SUSPICIOUS_AMOUNT = 500000; // High value purchase
  const VELOCITY_CHECK_MINUTES = 5;
  
  try {
    const userId = data.user_id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check daily purchase count
    const { count: dailyCount, error: countError } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'purchase')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());
      
    if (countError) throw countError;
    
    // Check purchase velocity (purchases in last X minutes)
    const velocityCheckTime = new Date();
    velocityCheckTime.setMinutes(velocityCheckTime.getMinutes() - VELOCITY_CHECK_MINUTES);
    
    const { count: velocityCount, error: velocityError } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'purchase')
      .eq('user_id', userId)
      .gte('created_at', velocityCheckTime.toISOString());
      
    if (velocityError) throw velocityError;
    
    // Get user's average purchase amount
    const { data: purchaseData, error: avgError } = await supabase
      .rpc('get_user_avg_purchase', { user_id_param: userId });
      
    if (avgError && !avgError.message.includes('does not exist')) throw avgError;
    
    const avgPurchaseAmount = purchaseData?.[0]?.avg_amount || 0;
    const purchaseAmountRatio = avgPurchaseAmount > 0 ? data.amount / avgPurchaseAmount : 1;
    
    // Anomaly detection logic
    const isSuspicious = 
      dailyCount >= MAX_DAILY_PURCHASES ||
      data.amount >= SUSPICIOUS_AMOUNT ||
      (purchaseAmountRatio > 5 && data.amount > 100000) || // 5x normal spending and significant amount
      velocityCount >= 3; // 3+ purchases in 5 minutes
    
    if (isSuspicious) {
      console.log(`Suspicious purchase detected: userId=${userId}, amount=${data.amount}, daily=${dailyCount}, velocity=${velocityCount}, ratio=${purchaseAmountRatio.toFixed(2)}x`);
      
      // If suspicious, record in security_alerts
      await supabase
        .from('security_alerts')
        .insert({
          user_id: userId,
          alert_type: 'suspicious_purchase',
          details: JSON.stringify({
            amount: data.amount,
            product_id: data.product_id,
            dailyCount,
            velocityCount,
            avgPurchaseAmount,
            purchaseAmountRatio
          }),
          status: 'open'
        });
    }
    
    return isSuspicious;
  } catch (error) {
    console.error('Error in purchase anomaly detection:', error);
    return false; // Fail open to prevent blocking legitimate purchases on error
  }
}

// Get geolocation data from IP (mock implementation)
async function getGeolocationData(ip: string) {
  // In production, you would use a real IP geolocation service
  // For this example, we'll return mock data
  return {
    country: 'Vietnam',
    city: 'Ho Chi Minh City'
  };
}
