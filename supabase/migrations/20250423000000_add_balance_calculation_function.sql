
-- Create function to calculate user balance from transaction history
CREATE OR REPLACE FUNCTION public.calculate_user_balance(user_id_param UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance NUMERIC;
BEGIN
  -- Calculate balance from transactions
  SELECT COALESCE(SUM(amount), 0) INTO balance
  FROM public.transactions
  WHERE user_id = user_id_param AND status = 'completed';
  
  RETURN balance;
END;
$$;

-- Update the update_user_balance function to be more robust
CREATE OR REPLACE FUNCTION public.update_user_balance(user_id_param UUID, amount_param NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INT;
BEGIN
  UPDATE public.profiles
  SET balance = balance + amount_param
  WHERE id = user_id_param;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$;

-- Create trigger function to manage transaction balances
CREATE OR REPLACE FUNCTION update_profile_balance_from_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run for new transactions marked as completed
  IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
    -- Update the user's balance
    PERFORM update_user_balance(NEW.user_id, NEW.amount);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS update_balance_on_transaction_trigger ON public.transactions;
CREATE TRIGGER update_balance_on_transaction_trigger
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_balance_from_transaction();
