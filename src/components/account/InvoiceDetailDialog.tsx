import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Invoice } from '@/integrations/supabase/types-extension';

interface InvoiceDetailDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: () => void;
}

const InvoiceDetailDialog = ({ 
  invoice, 
  open, 
  onOpenChange,
  onDownload 
}: InvoiceDetailDialogProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép cửa sổ pop-up để in hóa đơn.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn #${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-id { font-size: 24px; font-weight: bold; }
            .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Hóa đơn #{invoice.invoice_number}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div id="invoice-content" className="space-y-6">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">Hóa đơn / Biên lai</h2>
                <p className="text-muted-foreground">Digital Deals Hub</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Mã hóa đơn: {invoice.invoice_number}</p>
                <p className="text-muted-foreground">
                  Ngày: {new Date(invoice.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            
            <Separator />
            
            {invoice.details?.recipient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin người mua:</h3>
                  <p>{invoice.details.recipient.name || 'N/A'}</p>
                  <p>{invoice.details.recipient.email || 'N/A'}</p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Chi tiết sản phẩm:</h3>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left">Sản phẩm</th>
                      <th className="p-2 text-right">Số lượng</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.details?.products?.map((product, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{product.title}</td>
                        <td className="p-2 text-right">{product.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(product.price)}</td>
                        <td className="p-2 text-right">{formatCurrency(product.price * product.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-medium">
                      <td colSpan={3} className="p-2 text-right">Tổng cộng:</td>
                      <td className="p-2 text-right">{formatCurrency(invoice.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-8">
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              <p>Đây là hóa đơn điện tử được tạo tự động.</p>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between gap-2 mt-4">
          <div className="text-sm text-muted-foreground">
            Mã đơn hàng: {invoice.order_id.substring(0, 8)}...
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </Button>
            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Tải hóa đơn PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailDialog;
