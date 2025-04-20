
-- Function to get product keys by order ID
CREATE OR REPLACE FUNCTION public.get_product_keys_by_order(order_id_param UUID)
RETURNS SETOF public.product_keys
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pk.* 
  FROM public.product_keys pk
  JOIN public.orders o ON pk.order_id = o.id
  WHERE pk.order_id = order_id_param
  AND (
    -- Admin can see all keys
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
    OR
    -- User can see their own keys
    o.user_id = auth.uid()
  )
  ORDER BY pk.created_at ASC;
$$;
