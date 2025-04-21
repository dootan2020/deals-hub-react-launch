
-- Create security events table to track login and purchase attempts
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('login', 'purchase')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure either email or user_id is provided
  CONSTRAINT email_or_user_id CHECK (
    (email IS NOT NULL) OR (user_id IS NOT NULL)
  )
);

-- Create security alerts table to track suspicious activity
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'false_positive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add function to get user's average purchase amount
CREATE OR REPLACE FUNCTION public.get_user_avg_purchase(user_id_param UUID)
RETURNS TABLE(avg_amount NUMERIC, total_purchases BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG((metadata->>'amount')::numeric) as avg_amount,
    COUNT(*) as total_purchases
  FROM public.security_events
  WHERE 
    user_id = user_id_param 
    AND type = 'purchase';
END;
$$;

-- Setup RLS policies for security tables
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can select from security events
CREATE POLICY "Admins can select security_events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can select from security alerts
CREATE POLICY "Admins can select security_alerts" ON public.security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update security alerts (for resolving them)
CREATE POLICY "Admins can update security_alerts" ON public.security_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policy to allow edge functions to insert security events
CREATE POLICY "Service role can insert security_events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- RLS policy to allow edge functions to insert security alerts
CREATE POLICY "Service role can insert security_alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);
