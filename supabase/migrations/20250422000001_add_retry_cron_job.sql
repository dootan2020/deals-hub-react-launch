
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to invoke the retry edge function
CREATE OR REPLACE FUNCTION invoke_retry_pending_deposits()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id text;
  anon_key text;
BEGIN
  -- Get the anon key from vault (assuming it's stored there, or hardcode it if necessary)
  SELECT decrypted_secret FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_ANON_KEY' 
  INTO anon_key;
  
  -- Default to environment variable if not found in vault
  IF anon_key IS NULL THEN
    anon_key := current_setting('app.settings.anon_key', true);
  END IF;

  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/retry-pending-deposits',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || anon_key
      ),
      body := '{"maxAttempts":5,"maxAgeMins":120,"limitPerRun":20}'
    ) INTO request_id;
    
  RETURN request_id;
END;
$$;

-- Schedule the cron job to run every 5 minutes
SELECT cron.schedule(
  'retry-pending-deposits-every-5m',
  '*/5 * * * *',
  $$SELECT invoke_retry_pending_deposits()$$
);

-- Create a function to get pending deposits status
CREATE OR REPLACE FUNCTION get_pending_deposits_status()
RETURNS TABLE (
  total_pending bigint,
  needs_retry bigint,
  processed_today bigint,
  failed_today bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH stats AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
      COUNT(*) FILTER (WHERE status = 'pending' AND process_attempts > 0) AS needs_retry,
      COUNT(*) FILTER (WHERE status = 'completed' AND DATE(updated_at) = CURRENT_DATE) AS processed_today,
      COUNT(*) FILTER (WHERE status = 'failed' AND DATE(updated_at) = CURRENT_DATE) AS failed_today
    FROM public.deposits
  )
  SELECT 
    total_pending,
    needs_retry,
    processed_today,
    failed_today
  FROM stats;
$$;
