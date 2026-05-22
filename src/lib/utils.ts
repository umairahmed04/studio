import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively removes undefined values from an object.
 * Firestore does not support undefined.
 */
export function cleanForFirestore(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore);
  }

  // Handle plain objects
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined and the internal Firestore 'id' field if it was added by hooks
    if (value === undefined || key === 'id') continue;
    cleaned[key] = cleanForFirestore(value);
  }
  return cleaned;
}
