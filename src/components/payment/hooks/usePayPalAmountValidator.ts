
export const usePayPalAmountValidator = (amount: number) => {
  const isValidAmount = !isNaN(amount) && amount >= 1;
  return { isValidAmount };
};
