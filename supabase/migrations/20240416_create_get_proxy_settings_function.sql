
-- Create a function to get the latest proxy settings
CREATE OR REPLACE FUNCTION get_latest_proxy_settings()
RETURNS TABLE (
  id UUID, 
  proxy_type TEXT, 
  custom_url TEXT, 
  created_at TIMESTAMPTZ, 
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.proxy_type, 
    p.custom_url, 
    p.created_at, 
    p.updated_at
  FROM 
    proxy_settings p
  ORDER BY 
    p.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
