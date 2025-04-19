
import React from 'react';
import { Input } from '@/components/ui/input';

interface PromotionInputProps {
  promotionCode: string;
  onPromotionChange: (code: string) => void;
}

export const PromotionInput = ({ promotionCode, onPromotionChange }: PromotionInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Mã giảm giá (không bắt buộc):</label>
      <Input
        placeholder="Nhập mã giảm giá"
        value={promotionCode}
        onChange={(e) => onPromotionChange(e.target.value)}
        className="border-gray-300"
      />
    </div>
  );
};
