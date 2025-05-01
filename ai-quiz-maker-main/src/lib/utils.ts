import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a simple unique ID.
 * Not cryptographically secure, just for client-side key generation.
 */
export function generateId(prefix = 'id'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
}
