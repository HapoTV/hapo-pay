/**
 * Currency Formatting Utilities
 * Handle currency display, conversion, and formatting
 */

/**
 * Format amount as currency string
 * @param amount - Numeric amount to format
 * @param currency - Currency symbol (default: 'R' for South African Rand)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "R100.00")
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'R',
  decimals: number = 2
): string => {
  if (!Number.isFinite(amount)) {
    return `${currency}0.00`;
  }
  return `${currency}${amount.toFixed(decimals)}`;
};

/**
 * Format amount without currency symbol
 * @param amount - Numeric amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., "100.00")
 */
export const formatAmount = (amount: number, decimals: number = 2): string => {
  if (!Number.isFinite(amount)) {
    return '0.00';
  }
  return amount.toFixed(decimals);
};

/**
 * Parse currency string to number
 * @param value - String value with currency (e.g., "R100" or "100")
 * @returns Parsed numeric value or 0 if invalid
 */
export const parseCurrencyValue = (value: string): number => {
  const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Convert amount between currencies (basic - no exchange rates)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted amount (note: this is basic, no real exchange rates)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // In a real app, you'd use actual exchange rates from an API
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return amount; // Placeholder for actual conversion logic
};
