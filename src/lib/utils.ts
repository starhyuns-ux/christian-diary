import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, fmt = 'PPP') {
  return format(parseISO(dateStr), fmt, { locale: ko })
}

export function formatDateRange(startStr: string, endStr: string) {
  const start = parseISO(startStr)
  const end = parseISO(endStr)
  const startFormatted = format(start, 'M월 d일 (E) HH:mm', { locale: ko })
  const endFormatted = format(end, 'HH:mm', { locale: ko })
  return `${startFormatted} ~ ${endFormatted}`
}
