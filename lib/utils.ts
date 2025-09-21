import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculateAttendancePercentage(present: number, total: number) {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}

export function generatePassword(length: number = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export function generateUsername(firstName: string, lastName: string) {
  const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
  const random = Math.floor(Math.random() * 1000)
  return `${base}${random}`
}
