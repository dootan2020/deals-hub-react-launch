
import { formatCurrency } from '@/lib/utils';

export const formatVND = (amount: number): string => {
  return formatCurrency(amount);
};

export const convertVNDtoUSD = (vnd: number, rate: number): number => {
  // Ensure the minimum value is $0.01 and round to 2 decimal places
  return Math.max(0.01, Number((vnd / rate).toFixed(2)));
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
