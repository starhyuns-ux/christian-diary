'use client'

import { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { EventSourceInput } from '@fullcalendar/core'
import { useRouter } from 'next/navigation'
import { Event, CATEGORY_CONFIG } from '@/types'
import { HOLIDAYS_2026 } from '@/lib/holidays'

interface Props {
  events: Event[]
  onDateClick?: (date: string) => void
  onDatesSet?: (date: Date) => void
}

export default function CalendarView({ events, onDateClick, onDatesSet }: Props) {
  const router = useRouter()

  const userEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_at,
    end: event.end_at || undefined,
    backgroundColor: CATEGORY_CONFIG[event.category].bgColor,
    borderColor: 'transparent',
    textColor: CATEGORY_CONFIG[event.category].color, // 색상 대비 최적화
    extendedProps: { 
      category: event.category,
      original_id: event.original_id 
    },
    className: `fc-event-${event.category}`,
  }))

  const holidayEvents = HOLIDAYS_2026.map(holiday => ({
    title: holiday.title,
    start: holiday.start,
    end: holiday.end,
    allDay: true,
    backgroundColor: '#fff1f2', // 연한 분홍 배경
    textColor: '#e11d48',       // 진한 빨간 글씨
    className: 'fc-event-holiday',
    interactive: false,
  }))

  const calendarEvents: EventSourceInput = [...userEvents, ...holidayEvents]

  return (
    <div className="calendar-container glass p-3 sm:p-5 rounded-[2rem] border border-slate-200">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        displayEventEnd={false}
        buttonText={{
          today: '오늘',
          month: '월간',
          week: '주간',
          list: '목록',
        }}
        events={calendarEvents}
        eventClick={info => {
          const originalId = info.event.extendedProps.original_id
          const eventId = originalId || info.event.id
          if (eventId) {
            router.push(`/events/${eventId}`)
          }
        }}
        dateClick={info => {
          if (onDateClick) {
            onDateClick(info.dateStr)
          }
        }}
        datesSet={info => {
          if (onDatesSet) {
            const current = new Date()
            const viewStart = info.view.currentStart
            if (viewStart.getMonth() === current.getMonth() && viewStart.getFullYear() === current.getFullYear()) {
              onDatesSet(current)
            } else {
              onDatesSet(viewStart)
            }
          }
        }}
        height="auto"
        aspectRatio={1.35} // 높이를 줄여 더 컴팩트하게 조절
        fixedWeekCount={false} // 불필요한 빈 주 방지
        dayMaxEvents={3}
        moreLinkText="개 더보기"
        nowIndicator
        eventDisplay="block"
      />
    </div>
  )
}
