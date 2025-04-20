
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PromotionCodeInputProps {
  promotionCode: string;
  onChange: (value: string) => void;
}

export const PromotionCodeInput = ({ promotionCode, onChange }: PromotionCodeInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="promotionCode">Mã giảm giá (tùy chọn):</Label>
      <Input
        id="promotionCode"
        value={promotionCode}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập mã giảm giá nếu có"
        className="w-full"
      />
    </div>
  );
};
