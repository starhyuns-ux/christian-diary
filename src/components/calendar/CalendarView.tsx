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

interface Props {
  events: Event[]
}

export default function CalendarView({ events }: Props) {
  const router = useRouter()

  const calendarEvents: EventSourceInput = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_at,
    end: event.end_at,
    backgroundColor: CATEGORY_CONFIG[event.category].bgColor,
    borderColor: 'transparent',
    textColor: '#fff',
    extendedProps: { category: event.category },
  }))

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale="ko"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek',
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
      height="auto"
      aspectRatio={1.5}
      dayMaxEvents={3}
      moreLinkText="개 더보기"
      nowIndicator
      eventDisplay="block"
    />
  )
}
