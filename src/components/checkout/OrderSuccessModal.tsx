
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCheck, ClipboardCopy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  products: any[];
}

export function OrderSuccessModal({ open, onClose, orderId, products }: OrderSuccessModalProps) {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopyToClipboard = () => {
    let text = `Order ID: ${orderId}\n\nProducts:\n`;
    
    products.forEach((item, index) => {
      text += `${index + 1}. ${item.product}\n`;
      
      // Add other fields if available
      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'product' && value) {
          text += `   - ${key}: ${value}\n`;
        }
      });
      
      text += '\n';
    });
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Order details copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy. Please try again.');
    });
  };
  
  // Generate a downloadable text file of order details
  const handleDownload = () => {
    let text = `Order ID: ${orderId}\n\nProducts:\n`;
    
    products.forEach((item, index) => {
      text += `${index + 1}. ${item.product}\n`;
      
      // Add other fields if available
      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'product' && value) {
          text += `   - ${key}: ${value}\n`;
        }
      });
      
      text += '\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `order-${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    
    toast.success('Order details downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-green-600">
            <CheckCheck className="h-6 w-6 mr-2" />
            Order Completed Successfully!
          </DialogTitle>
          <DialogDescription>
            Your order has been processed. Order ID: <span className="font-mono bg-muted p-1 rounded">{orderId}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="border rounded-md p-4 bg-muted/50 my-4 max-h-64 overflow-y-auto">
          <h3 className="font-medium mb-2 text-muted-foreground">Product Details:</h3>
          
          <ul className="space-y-3">
            {products.map((item, index) => (
              <li key={index} className="border-b pb-2 last:border-0">
                <p className="font-medium">{item.product}</p>
                
                {Object.entries(item).map(([key, value]) => 
                  key !== 'product' && value ? (
                    <div key={key} className="grid grid-cols-12 gap-1 text-sm mt-1">
                      <span className="col-span-3 text-muted-foreground capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="col-span-9 font-mono break-all">
                        {String(value)}
                      </span>
                    </div>
                  ) : null
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            className="sm:w-auto w-full"
          >
            {copied ? (
              <>
                <CheckCheck className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4 mr-2" />
                Copy All Details
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownload}
            className="sm:w-auto w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button onClick={onClose} className="sm:w-auto w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
