
/**
 * Calculate payment processing fees
 * PayPal fees are typically 2.9% + $0.30 per transaction
 */
export function calculateFee(amount: number): number {
  const fee = amount * 0.029 + 0.30;
  return Number(fee.toFixed(2));
}

/**
 * Calculate net amount after fees
 */
export function calculateNetAmount(amount: number): number {
  const fee = calculateFee(amount);
  return Number((amount - fee).toFixed(2));
}
