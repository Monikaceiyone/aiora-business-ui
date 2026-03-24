import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize a phone number to digits-only (E.164 without the +).
 * Strips whitespace, dashes, parens, and leading +.
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-\+\(\)]/g, '');
}

/**
 * Validate and normalize an Indian phone number to E.164 (+91XXXXXXXXXX).
 * Accepts: 9971589168, 09971589168, 919971589168, +919971589168, etc.
 */
export function validateAndNormalizeIndianPhone(raw: string):
  | { valid: true; e164: string; digits: string }
  | { valid: false; reason: string } {
  let digits = raw.replace(/[^0-9]/g, '');
  // Handle international prefix variants like 0091XXXXXXXXXX.
  while (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  const core = digits.startsWith('91') && digits.length > 10
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  if (core.length !== 10)
    return { valid: false, reason: `Phone number must be 10 digits. Got ${core.length} digits.` };
  if (!/^[6-9]/.test(core))
    return { valid: false, reason: 'Indian mobile numbers must start with 6, 7, 8, or 9.' };
  return { valid: true, e164: `+91${core}`, digits: core };
}

/**
 * Validate an Indian pincode (exactly 6 digits, first digit 1-9).
 */
export function validatePincode(raw: string):
  | { valid: true; pincode: string }
  | { valid: false; reason: string } {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length !== 6)
    return { valid: false, reason: `Pincode must be exactly 6 digits. Got ${digits.length} digits.` };
  if (digits.startsWith('0'))
    return { valid: false, reason: 'Pincode cannot start with 0.' };
  return { valid: true, pincode: digits };
}

/**
 * Format currency for Indian market
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Format date for Indian market
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}