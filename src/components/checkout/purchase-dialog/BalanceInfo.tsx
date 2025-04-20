
import React from 'react';
import { formatUSD } from '@/utils/currency';
import { Loader2 } from 'lucide-react';

interface BalanceInfoProps {
  isLoadingBalance: boolean;
  userBalance: number | null;
  totalPriceUSD: number;
}

export const BalanceInfo = ({
  isLoadingBalance,
  userBalance,
  totalPriceUSD,
}: BalanceInfoProps) => {
  return (
    <div className="flex justify-between items-center p-3 bg-secondary/20 rounded-md border border-border">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">Số dư tài khoản:</span>
        {isLoadingBalance ? (
          <div className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : (
          <span className="font-medium">{formatUSD(userBalance || 0)}</span>
        )}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm text-muted-foreground">Tổng tiền:</span>
        <span className="font-medium text-primary">{formatUSD(totalPriceUSD)}</span>
      </div>
    </div>
  );
};
