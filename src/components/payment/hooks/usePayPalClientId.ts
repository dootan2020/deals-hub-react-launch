
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePayPalClientId = () => {
  const [paypalClientId, setPaypalClientId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayPalClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-config', {
          body: { key: 'PAYPAL_CLIENT_ID' }
        });
        if (error) {
          setErrorMessage('Không thể kết nối với PayPal. Vui lòng thử lại sau.');
        } else if (data?.value) {
          setPaypalClientId(data.value);
        } else {
          setErrorMessage('Cấu hình PayPal chưa được thiết lập.');
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Lỗi khi kết nối với PayPal. Vui lòng thử lại sau.';
        setErrorMessage(msg);
      }
    };
    fetchPayPalClientId();
  }, []);

  return { paypalClientId, errorMessage, setErrorMessage };
};
