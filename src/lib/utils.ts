/**
 * @file utils.ts
 * @description Shared utility functions used across the SubTract application.
 * The `cn` helper is required by all shadcn/ui components and must live here.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names, resolving conflicts correctly.
 * Re-exported from shadcn/ui's standard utility location.
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-red-500', 'px-4') // → 'py-1 bg-red-500 px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a USD dollar amount with commas and two decimal places.
 *
 * @example
 * formatCurrency(1234.5) // → '$1,234.50'
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generates a lightweight pseudo-UUID suitable for client-side audit IDs.
 * For production persistence, replace with a proper UUID library or DB-generated ID.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Returns an ISO-8601 timestamp string for the current moment.
 */
export function nowISO(): string {
  return new Date().toISOString();
}
