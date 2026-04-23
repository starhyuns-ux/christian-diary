import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addWeeks, addMonths } from 'date-fns'
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

export function toKST(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  // 서버 환경(UTC)에서도 한국 시간(+9시간)으로 표시되도록 조정
  // Intl.DateTimeFormat을 사용하여 타임존 보정
  return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
}

export function getGoogleCalendarUrl(event: Event) {
  const startAt = toKST(event.start_at)
  const start = startAt.toISOString().replace(/-|:|\.\d\d\d/g, '')
  
  // 종료 시간이 없으면 시작 시간 + 1시간으로 설정
  const endAt = event.end_at 
    ? toKST(event.end_at) 
    : new Date(startAt.getTime() + 60 * 60 * 1000)
    
  const end = endAt.toISOString().replace(/-|:|\.\d\d\d/g, '')
  
  const details = encodeURIComponent(event.description || '')
  const location = encodeURIComponent(
    [event.location_name, event.location_address].filter(Boolean).join(', ')
  )
  const title = encodeURIComponent(event.title)

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
}

/**
 * 반복 일정을 지정된 횟수만큼 확장하여 생성합니다.
 * recurrence_rule에 따라 주간(weekly) 또는 월간(monthly)으로 확장합니다.
 */
export function expandRecurringEvents(events: Event[], count = 12): Event[] {
  const expanded: Event[] = []
  
  events.forEach(event => {
    // 원본은 무조건 추가
    expanded.push({ ...event, original_id: event.id })
    
    // 반복 설정이 되어 있는 경우만 추가 생성
    if (event.is_recurring) {
      const rule = event.recurrence_rule || 'weekly'
      
      for (let i = 1; i <= count; i++) {
        let nextStart, nextEnd
        
        if (rule === 'monthly') {
          nextStart = addMonths(parseISO(event.start_at), i)
          nextEnd = event.end_at ? addMonths(parseISO(event.end_at), i) : null
        } else {
          // 기본값은 weekly
          nextStart = addWeeks(parseISO(event.start_at), i)
          nextEnd = event.end_at ? addWeeks(parseISO(event.end_at), i) : null
        }
        
        expanded.push({
          ...event,
          id: `${event.id}-${i}`, 
          start_at: nextStart.toISOString(),
          end_at: nextEnd ? nextEnd.toISOString() : null,
          original_id: event.id // 원본 ID 유지
        } as Event)
      }
    }
  })
  
  return expanded
}
