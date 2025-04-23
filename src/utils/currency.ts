
/**
 * Formats a number as a currency string
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'vi-VN')
 * @param currency - The currency to use (default: 'VND')
 * @returns The formatted currency string
 */
export const formatCurrency = (
  amount: number,
  locale: string = 'vi-VN',
  currency: string = 'VND'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formats a number as USD currency
 * @param amount - The amount to format in USD
 * @returns The formatted USD currency string
 */
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formats a price with a discount
 * @param price - The current price
 * @param originalPrice - The original price before discount
 * @returns Object containing formatted price strings and discount percentage
 */
export const formatPriceWithDiscount = (price: number, originalPrice?: number) => {
  const formattedPrice = formatCurrency(price);
  
  if (!originalPrice || originalPrice <= price) {
    return {
      formattedPrice,
      formattedOriginalPrice: null,
      discountPercentage: 0
    };
  }
  
  const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  
  return {
    formattedPrice,
    formattedOriginalPrice: formatCurrency(originalPrice),
    discountPercentage
  };
};
