
// Utility functions for all core flows

// Safe data extraction
export function extractSafeData<T>(result: { data: any; error: any }): T | null {
  if (result.error || !result.data) {
    console.error("Error extracting data:", result.error);
    return null;
  }
  return result.data as T;
}

// Safe number conversion
export function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Format currency helper
export function formatCurrency(amount: number | null = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
}
