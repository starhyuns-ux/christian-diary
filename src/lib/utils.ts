import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

import { Event } from '@/types'

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

export function getGoogleCalendarUrl(event: Event) {
  const start = parseISO(event.start_at).toISOString().replace(/-|:|\.\d\d\d/g, '')
  const end = parseISO(event.end_at).toISOString().replace(/-|:|\.\d\d\d/g, '')
  
  const details = encodeURIComponent(event.description || '')
  const location = encodeURIComponent(
    [event.location_name, event.location_address].filter(Boolean).join(', ')
  )
  const title = encodeURIComponent(event.title)

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
}
