/**
 * Currency formatting utilities
 */

export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toFixed(2)}`;
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `KES ${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};
