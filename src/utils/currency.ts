
// A simple utility for formatting currency values

/**
 * Format a number as currency
 * @param value The value to format
 * @param currency The currency code to use (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns A formatted currency string
 */
export const formatCurrency = (
  value: number, 
  currency = 'USD', 
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number specifically as USD
 * @param value The value to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns A formatted USD currency string
 */
export const formatUSD = (value: number, locale = 'en-US'): string => {
  return formatCurrency(value, 'USD', locale);
};
