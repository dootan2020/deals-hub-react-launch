
import { ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ProductTrustBadges = () => {
  return (
    <div className="flex flex-col gap-3 mt-6 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Cam kết của chúng tôi:</h3>
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm text-text-light">Thanh toán an toàn – 100% bảo mật</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm text-text-light">Giao hàng tự động</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-primary" />
          <span className="text-sm text-text-light">Hỗ trợ 24/7</span>
        </div>
      </div>
    </div>
  );
};
