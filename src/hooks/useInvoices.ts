
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceProduct {
  title: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  created_at: string;
  status: string;
  amount: number;
  details: {
    products: InvoiceProduct[];
    recipient?: {
      name?: string;
      email?: string;
    };
  };
  order_id: string;
  user_id: string;
}

export const useInvoices = (userId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (invoiceError) throw invoiceError;
        
        setInvoices(invoiceData || []);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [userId]);

  const getInvoiceById = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching invoice:', err);
      throw err;
    }
  };

  const generateInvoicePdf = async (invoice: Invoice): Promise<string> => {
    // Trong thực tế, đây là nơi bạn có thể gọi API để tạo PDF
    // Ở đây chúng ta chỉ giả lập và trả về một URL
    // Trong ứng dụng thực tế, bạn có thể sử dụng thư viện PDF.js hoặc một dịch vụ bên ngoài
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`data:application/pdf;base64,JVBERi0xLjcKJb/3ov4KMiAwIG9iago8PCAvTGluZWFyaXplZCAxIC9MIDUwNzUwIC9IIFsgNzM3IDEyOCBdIC9PIDMgL0UgNTA0NzUgL04gMSAvVCA1MDU3NCA+PgplbmRvYmoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMSAwIFIgL1Jlc291cmNlcyAyIDAgUiAvQ29udGVudHMgNCAwIFIgL01lZGlhQm94IFsgMCAwIDU5NS4yNzU1OTEgODQxLjg5MDI0OF0gPj4KZW5kb2JqCg0KNCAwIG9iago8PCAvRmlsdGVyIC9GbGF0ZURlY29kZSAvTGVuZ3RoIDY2ID4+CnN0cmVhbQp4nK3NQQrCQBBE0X1O0XcIuJiZTrKZi3gDQQRdKfbeP4gxiwhe4BX1+UC1qd5ZfQJ3XCATqjwSZUliYvY4qTtSC0eRVSz7dj1spY+6T/7xRfltYgwKZW5kc3RyZWFtCmVuZG9iagoxIDAgb2JqDTw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWyAzIDAgUiBdID4+CmVuZG9iag01IDAgb2JqCjw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAxIDAgUiAvPj4KZW5kb2JqCjYgMCBvYmoKPDwgL1Byb2R1Y2VyIChweXRob24tcGRmMiBodHRwczovL3B5cGRmMi5yZWFkdGhlZG9jcy5pby9lbi9sYXRlc3QvKQovQ3JlYXRvciAo0YPRgdC/0LXRiNC90L7QtSDRgdC+0LfQtNCw0L3QuNC1IGRlbW8gUERGKQovQ3JlYXRpb25EYXRlIChEOjIwMjUwNDIwMDAyOTQwKSA+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIA0wMDAwMDUwNTcyIDAwMDAwIG4gDQowMDAwMDAwMDE2IDAwMDAwIG4gDQowMDAwMDAwODY1IDAwMDAwIG4gDQowMDAwMDUwMzI2IDAwMDAwIG4gDQowMDAwMDUwNjIxIDAwMDAwIG4gDQowMDAwMDUwNjcwIDAwMDAwIG4gDQp0cmFpbGVyCjw8IC9TaXplIDcgL1Jvb3QgNSAwIFIgL0luZm8gNiAwIFIgL0lEIFsgPGYzNWZmNjIyYWFhMDQ5YmFiYWRlYzNjZjk1NDRkNjhmPiA8ZjM1ZmY2MjJhYWEwNDliYWJhZGVjM2NmOTU0NGQ2OGY+IF0gPj4Kc3RhcnR4cmVmCjUwODIxCiUlRU9GCg==`);
      }, 500);
    });
  };

  return { 
    invoices, 
    isLoading, 
    error,
    getInvoiceById,
    generateInvoicePdf
  };
};
