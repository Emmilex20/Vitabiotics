/**
 * Currency utilities (Naira - ₦)
 *
 * The app stores and displays prices in Naira. Use `formatNaira` to format numeric
 * amounts into a localized Naira string (e.g., ₦1,500), and `getNairaPrice` is
 * a compatibility helper that returns the numeric amount (identity).
 */

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Return the amount as-is (keeps compatibility with older code that passed USD)
export const getNairaPrice = (amount: number): number => {
  return Math.round(amount);
};
