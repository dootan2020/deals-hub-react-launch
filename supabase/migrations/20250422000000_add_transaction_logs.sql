
-- Create transaction_logs table to track processing attempts and errors
CREATE TABLE IF NOT EXISTS public.transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  deposit_id UUID REFERENCES public.deposits(id),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  processing_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  idempotency_key TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transaction_logs_transaction_id ON public.transaction_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_deposit_id ON public.transaction_logs(deposit_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_idempotency_key ON public.transaction_logs(idempotency_key);

-- Add is_processed field to deposits if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'deposits' AND column_name = 'is_processed'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN is_processed BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'deposits' AND column_name = 'process_attempts'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN process_attempts INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'deposits' AND column_name = 'last_attempt_at'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN last_attempt_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'deposits' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN idempotency_key TEXT;
  END IF;
END $$;
