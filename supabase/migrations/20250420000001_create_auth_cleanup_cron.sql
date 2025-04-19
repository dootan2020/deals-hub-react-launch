
-- Enable the necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a scheduled job to run the auth-cleanup function daily at midnight
SELECT cron.schedule(
  'cleanup-unconfirmed-accounts',
  '0 0 * * *', -- Run at midnight every day (cron format: minute hour day month day_of_week)
  $$
  SELECT net.http_post(
    url:='https://xcpwyvrlutlslgaueokd.supabase.co/functions/v1/auth-cleanup',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcHd5dnJsdXRsc2xnYXVlb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTMwMDAsImV4cCI6MjA2MDMyOTAwMH0.6uScHil1Q02Mz-x6p_GQui7vchxIYLRcOCd8UsNiOp0"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
