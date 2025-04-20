
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/integrations/supabase/types-extension';

interface InvoiceDetails {
  products: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  recipient?: {
    name?: string;
    email?: string;
  };
}

export const generateInvoiceNumber = (): string => {
  // Tạo mã hóa đơn theo định dạng "INV-YYYYMMDD-XXXXX" 
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(10000 + Math.random() * 90000); // 5 chữ số ngẫu nhiên
  return `INV-${datePart}-${randomPart}`;
};

export const createInvoice = async (
  userId: string,
  orderId: string,
  amount: number,
  details: InvoiceDetails
): Promise<Invoice> => {
  try {
    const invoiceNumber = generateInvoiceNumber();
    
    const { data, error } = await supabase
      .from<Invoice>('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id: userId,
        order_id: orderId,
        amount,
        details,
        status: 'issued'
      })
      .select()
      .single();
      
    if (error) throw error;
    return data as Invoice;
  } catch (err) {
    console.error('Error creating invoice:', err);
    throw err;
  }
};

export const getInvoiceByOrderId = async (userId: string, orderId: string): Promise<Invoice | null> => {
  try {
    const { data, error } = await supabase
      .from<Invoice>('invoices')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data as Invoice | null;
  } catch (err) {
    console.error('Error fetching invoice:', err);
    throw err;
  }
};
