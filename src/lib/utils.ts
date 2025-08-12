import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safely serialize objects containing BigInt and Dates for JSON responses
export function toSafeJSON<T>(value: T): any {
  return JSON.parse(
    JSON.stringify(value, (_, v) => {
      if (typeof v === 'bigint') return v.toString()
      if (v instanceof Date) return v.toISOString()
      return v
    })
  )
}

