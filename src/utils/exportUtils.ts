
import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const formatOrderForExport = (order: any) => ({
  'Mã đơn': order.id.slice(0, 8),
  'Khách hàng': order.user.email,
  'Sản phẩm': order.product.title,
  'Tổng tiền': order.total_price,
  'Trạng thái': order.status,
  'Ngày tạo': new Date(order.created_at).toLocaleDateString('vi-VN'),
});
