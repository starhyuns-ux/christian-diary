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
}

export default function CalendarView({ events, onDateClick }: Props) {
  const router = useRouter()

  const userEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_at,
    end: event.end_at,
    backgroundColor: CATEGORY_CONFIG[event.category].bgColor,
    borderColor: 'transparent',
    textColor: '#fff',
    extendedProps: { category: event.category },
  }))

  const holidayEvents = HOLIDAYS_2026.map(holiday => ({
    title: holiday.title,
    start: holiday.start,
    end: holiday.end,
    allDay: true,
    className: 'fc-event-holiday',
    interactive: false, // 공휴일은 클릭 불가
  }))

  const calendarEvents: EventSourceInput = [...userEvents, ...holidayEvents]

  return (
    <div className="calendar-container glass p-4 sm:p-6 rounded-[2rem] border border-slate-200">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        buttonText={{
          today: '오늘',
          month: '월간',
          week: '주간',
          list: '목록',
        }}
        events={calendarEvents}
        eventClick={info => {
          router.push(`/events/${info.event.id}`)
        }}
        dateClick={info => {
          if (onDateClick) {
            onDateClick(info.dateStr)
          }
        }}
        height="auto"
        aspectRatio={1} // Fixed aspect ratio for consistency, handled via CSS if needed
        dayMaxEvents={2}
        moreLinkText="개 더보기"
        nowIndicator
        eventDisplay="block"
      />
    </div>
  )
}
