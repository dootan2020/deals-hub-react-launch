
-- Create security logs table to track rate limiting and other security events
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  event_type TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  endpoint TEXT,
  identifier TEXT,
  user_id UUID,
  allowed BOOLEAN DEFAULT true,
  remaining_attempts INTEGER,
  metadata JSONB,
  request_info JSONB
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS security_logs_event_type_idx ON public.security_logs(event_type);
CREATE INDEX IF NOT EXISTS security_logs_ip_address_idx ON public.security_logs(ip_address);
CREATE INDEX IF NOT EXISTS security_logs_created_at_idx ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS security_logs_user_id_idx ON public.security_logs(user_id);

-- Comments for better understanding
COMMENT ON TABLE public.security_logs IS 'Logs for security events like rate limiting, failed logins, etc.';
COMMENT ON COLUMN public.security_logs.event_type IS 'Type of security event (rate_limit, failed_login, etc.)';
COMMENT ON COLUMN public.security_logs.ip_address IS 'IP address that triggered the event';
COMMENT ON COLUMN public.security_logs.allowed IS 'Whether the request was allowed or blocked';
COMMENT ON COLUMN public.security_logs.remaining_attempts IS 'Remaining attempts for rate-limited requests';

-- Enable RLS but allow service role access for logging
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert from service role
CREATE POLICY "Service Role Can Insert Security Logs" 
  ON public.security_logs 
  FOR INSERT 
  TO service_role
  USING (true);

-- Create policy to allow select from admin/staff role
CREATE POLICY "Admin and Staff Can View Security Logs" 
  ON public.security_logs 
  FOR SELECT 
  USING (
    auth.jwt() -> 'role' ? 'admin' OR 
    auth.jwt() -> 'role' ? 'staff'
  );

-- Create cron job to delete old logs (keeps last 30 days)
SELECT cron.schedule(
  'cleanup-security-logs',
  '0 3 * * *',  -- Every day at 3 AM
  $$
    DELETE FROM public.security_logs 
    WHERE created_at < now() - INTERVAL '30 days';
  $$
);
