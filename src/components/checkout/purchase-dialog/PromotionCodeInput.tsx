
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface PromotionCodeInputProps {
  promotionCode: string;
  onChange: (value: string) => void;
}

export const PromotionCodeInput = ({ promotionCode, onChange }: PromotionCodeInputProps) => {
  // Sanitize on every change
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitized = sanitizeHtml(value.trim());
    onChange(sanitized);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="promotionCode">Mã giảm giá (tùy chọn):</Label>
      <Input
        id="promotionCode"
        value={promotionCode}
        onChange={handleInput}
        placeholder="Nhập mã giảm giá nếu có"
        className="w-full"
      />
    </div>
  );
};
