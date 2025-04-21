
-- Create transaction_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT,
  deposit_id UUID REFERENCES public.deposits(id),
  status TEXT NOT NULL,
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  processing_time TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on idempotency_key for faster lookups
CREATE INDEX IF NOT EXISTS transaction_logs_idempotency_key_idx ON public.transaction_logs(idempotency_key);

-- Add idempotency_key column to tables if they don't have it
DO $$
BEGIN
  -- Add to deposits table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'deposits' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.deposits ADD COLUMN idempotency_key TEXT;
    CREATE INDEX IF NOT EXISTS deposits_idempotency_key_idx ON public.deposits(idempotency_key);
  END IF;
  
  -- Add to transactions table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'transactions' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.transactions ADD COLUMN idempotency_key TEXT;
    CREATE INDEX IF NOT EXISTS transactions_idempotency_key_idx ON public.transactions(idempotency_key);
  END IF;
  
  -- Add to orders table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'orders' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.orders ADD COLUMN idempotency_key TEXT;
    CREATE INDEX IF NOT EXISTS orders_idempotency_key_idx ON public.orders(idempotency_key);
  END IF;
END
$$;
