
-- Function to calculate user balance from transaction history
CREATE OR REPLACE FUNCTION public.calculate_user_balance_from_transactions(user_id_param UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance NUMERIC := 0;
BEGIN
  -- Calculate balance from deposits and other transactions
  SELECT COALESCE(SUM(
    CASE
      WHEN type = 'deposit' AND status = 'completed' THEN amount
      WHEN type = 'purchase' AND status = 'completed' THEN -amount
      WHEN type = 'refund' AND status = 'completed' THEN amount
      WHEN type = 'adjustment' AND status = 'completed' THEN amount
      ELSE 0
    END
  ), 0)
  INTO balance
  FROM transactions
  WHERE user_id = user_id_param;
  
  RETURN balance;
END;
$$;
