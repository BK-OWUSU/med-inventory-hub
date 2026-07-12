import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const humanize = (text: string) => {
  return text
    .replace(/([A-Z])/g, ' $1') // Add space before caps
    .replace(/[_-]/g, ' ')      // Replace _ or - with spaces
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
    .trim();
};
