
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice } from '@/integrations/supabase/types-extension';
import { 
  prepareQueryParam, 
  safeCastArray, 
  processSupabaseData, 
  isSupabaseError,
  getSafeProperty
} from '@/utils/supabaseTypeUtils';

export type { Invoice };

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
          .eq('user_id', prepareQueryParam(userId))
          .order('created_at', { ascending: false });

        if (invoiceError) throw invoiceError;

        // Filter and safely cast array
        const validInvoices = safeCastArray<any>(invoiceData)
          .filter(invoice => !isSupabaseError(invoice))
          .map(invoice => ({
            id: getSafeProperty(invoice, 'id', ''),
            invoice_number: getSafeProperty(invoice, 'invoice_number', ''),
            user_id: getSafeProperty(invoice, 'user_id', ''),
            order_id: getSafeProperty(invoice, 'order_id', ''),
            amount: getSafeProperty(invoice, 'amount', 0),
            details: getSafeProperty(invoice, 'details', { products: [] }),
            status: getSafeProperty(invoice, 'status', ''),
            created_at: getSafeProperty(invoice, 'created_at', '')
          })) as Invoice[];
          
        setInvoices(validInvoices);
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
        .eq('id', prepareQueryParam(invoiceId))
        .eq('user_id', prepareQueryParam(userId))
        .single();

      if (error) throw error;
      
      // Validate that data is not an error before processing
      if (isSupabaseError(data)) {
        throw new Error('Invalid invoice data received');
      }
      
      // Map to ensure type safety
      const invoice: Invoice = {
        id: getSafeProperty(data, 'id', ''),
        invoice_number: getSafeProperty(data, 'invoice_number', ''),
        user_id: getSafeProperty(data, 'user_id', ''),
        order_id: getSafeProperty(data, 'order_id', ''),
        amount: getSafeProperty(data, 'amount', 0),
        details: getSafeProperty(data, 'details', { products: [] }),
        status: getSafeProperty(data, 'status', ''),
        created_at: getSafeProperty(data, 'created_at', '')
      };
      
      return invoice;
    } catch (err) {
      console.error('Error fetching invoice:', err);
      throw err;
    }
  };

  const generateInvoicePdf = async (invoice: Invoice): Promise<string> => {
    // In a real implementation, this would call an API to create PDF
    // Here we just simulate and return a base64 encoded PDF
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`data:application/pdf;base64,JVBERi0xLjcKJb/3ov4KMiAwIG9iago8PCAvTGluZWFyaXplZCAxIC9MIDUwNzUwIC9IIFsgNzM3IDEyOCBdIC9PIDMgL0UgNTA0NzUgL04gMSAvVCA1MDU3NCA+PgplbmRvYmoKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMSAwIFIgL1Jlc291cmNlcyAyIDAgUiAvQ29udGVudHMgNCAwIFIgL01lZGlhQm94IFsgMCAwIDU5NS4yNzU1OTEgODQxLjg5MDI0OF0gPj4KZW5kb2JqCg0KNCAwIG9iago8PCAvRmlsdGVyIC9GbGF0ZURlY29kZSAvTGVuZ3RoIDY2ID4+CnN0cmVhbQp4nK3NQQrCQBBE0X1O0XcIuJiZTrKZi3gDQQRdKfbeP4gxiwhe4BX1+UC1qd5ZfQJ3XCATqjwSZUliYvY4qTtSC0eRVSz7dj1spY+6T/7xRfltYgwKZW5kc3RyZWFtCmVuZG9iagoxIDAgb2JqDTw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWyAzIDAgUiBdID4+CmVuZG9iagoxIDAgUiAvS2lkc1sgMyAwIFIgXSA+PgplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMSAwIFIgLz4+CmVuZG9iago2IDAgb2JqCjw8IC9Qcm9kdWNlciAocHl0aG9uLXBkZjIgaHR0cHM6Ly9weXBkZjIucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0LykKL0NyZWF0b3IgKNGA0YPRgdC/0LXRiNC90L7QtSDRgdC+0LfQtNCw0L3QuNC1IGRlbW8gUERGKQovQ3JlYXRpb25EYXRlIChEOjIwMjUwNDIwMDAyOTQwKSA+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIA0wMDAwMDUwNTcyIDAwMDAwIG4gDQowMDAwMDAwMDE2IDAwMDAwIG4gDQowMDAwMDAwODY1IDAwMDAwIG4gDQowMDAwMDUwMzI2IDAwMDAwIG4gDQowMDAwMDUwNjIxIDAwMDAwIG4gDQowMDAwMDUwNjcwIDAwMDAwIG4gDQp0cmFpbGVyCjw8IC9TaXplIDcgL1Jvb3QgNSAwIFIgL0luZm8gNiAwIFIgL0lEIFsgPGYzNWZmNjIyYWFhMDQ5YmFiYWRlYzNjZjk1NDRkNjhmPiA8ZjM1ZmY2MjJhYWEwNDliYWJhZGVjM2NmOTU0NGQ2OGY+IF0gPj4Kc3RhcnR4cmVmCjUwODIxCiUlRU9GCg==`);
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
