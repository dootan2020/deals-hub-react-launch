
CREATE TABLE IF NOT EXISTS proxy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proxy_type TEXT NOT NULL DEFAULT 'allorigins',
  custom_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON proxy_settings
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();
