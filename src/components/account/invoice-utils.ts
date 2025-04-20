
import { createInvoice, getInvoiceByOrderId } from '@/services/invoiceService';

export const createInvoiceFromOrder = async (
  userId: string,
  orderId: string,
  orderDetails: any
) => {
  try {
    // Kiểm tra nếu hóa đơn đã tồn tại
    const existingInvoice = await getInvoiceByOrderId(userId, orderId);
    if (existingInvoice) {
      return existingInvoice;
    }
    
    // Tạo cấu trúc dữ liệu cho hóa đơn từ thông tin đơn hàng
    const orderAmount = orderDetails.total_amount || orderDetails.total_price;
    const products = orderDetails.items?.map((item: any) => ({
      title: item.title || item.product_title || 'Sản phẩm',
      price: item.price || (orderAmount / (item.quantity || 1)),
      quantity: item.quantity || 1
    })) || [];
    
    // Nếu không có items, nhưng có thông tin sản phẩm
    if (products.length === 0 && orderDetails.product_title) {
      products.push({
        title: orderDetails.product_title,
        price: orderAmount / (orderDetails.qty || 1),
        quantity: orderDetails.qty || 1
      });
    }
    
    // Tạo thông tin chi tiết hóa đơn
    const invoiceDetails = {
      products,
      recipient: {
        name: orderDetails.user_name || '',
        email: orderDetails.user_email || ''
      }
    };
    
    // Tạo hóa đơn mới
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

export const generateInvoiceForExistingOrder = async (userId: string, order: any) => {
  try {
    return await createInvoiceFromOrder(userId, order.id, order);
  } catch (err) {
    console.error('Error generating invoice for existing order:', err);
    throw err;
  }
};
