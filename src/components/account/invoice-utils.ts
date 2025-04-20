
import { createInvoice, getInvoiceByOrderId } from '@/services/invoiceService';
import { Invoice } from '@/integrations/supabase/types-extension';

export const createInvoiceFromOrder = async (
  userId: string,
  orderId: string,
  orderDetails: any
): Promise<Invoice | null> => {
  try {
    // Check if invoice already exists
    const existingInvoice = await getInvoiceByOrderId(userId, orderId);
    if (existingInvoice) {
      return existingInvoice;
    }
    
    // Create invoice data structure from order details
    const orderAmount = orderDetails.total_amount || orderDetails.total_price;
    const products = orderDetails.items?.map((item: any) => ({
      title: item.title || item.product_title || 'Sản phẩm',
      price: item.price || (orderAmount / (item.quantity || 1)),
      quantity: item.quantity || 1
    })) || [];
    
    // If no items but product info exists
    if (products.length === 0 && orderDetails.product_title) {
      products.push({
        title: orderDetails.product_title,
        price: orderAmount / (orderDetails.qty || 1),
        quantity: orderDetails.qty || 1
      });
    }
    
    // Create invoice details
    const invoiceDetails = {
      products,
      recipient: {
        name: orderDetails.user_name || '',
        email: orderDetails.user_email || ''
      }
    };
    
    // Create new invoice
    return await createInvoice(
      userId,
      orderId,
      orderAmount,
      invoiceDetails
    );
  } catch (err) {
    console.error('Error creating invoice from order:', err);
    throw err;
  }
};

export const generateInvoiceForExistingOrder = async (userId: string, order: any): Promise<Invoice | null> => {
  try {
    return await createInvoiceFromOrder(userId, order.id, order);
  } catch (err) {
    console.error('Error generating invoice for existing order:', err);
    throw err;
  }
};
