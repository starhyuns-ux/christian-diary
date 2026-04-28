export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { fetchEventById } from '@/lib/events'
import EventDetailClient from './EventDetailClient'
import Link from 'next/link'
import { format, parseISO, addWeeks, addMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toKST } from '@/lib/utils'

interface Props {
  params: { id: string }
}

// 가상 ID에서 원본 ID와 반복 회차를 추출하는 헬퍼 함수
function resolveEventInfo(id: string) {
  const parts = id.split('-')
  // UUID (4개의 하이픈) + 추가 하이픈(-) + 숫자 형태인 경우 가상 ID로 판단
  if (parts.length > 5 && !isNaN(Number(parts[parts.length - 1]))) {
    const index = parseInt(parts.pop()!)
    const originalId = parts.join('-')
    return { originalId, index }
  }
  return { originalId: id, index: 0 }
}

// 반복 일정의 실제 날짜를 계산하는 헬퍼 함수
function getRecurringDate(baseDate: string, index: number, rule: string = 'weekly') {
  const start = parseISO(baseDate)
  if (index === 0) return start
  
  return rule === 'monthly' ? addMonths(start, index) : addWeeks(start, index)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { originalId, index } = resolveEventInfo(params.id)
  const event = await fetchEventById(originalId)

  if (!event) {
    return {
      title: '모임을 찾을 수 없습니다 - 크리스천다이어리',
    }
  }

  // 가상 일정인 경우 날짜 재계산
  const actualStartDate = getRecurringDate(event.start_at, index, event.recurrence_rule || 'weekly')
  const kstDate = toKST(actualStartDate)
  
  const dateShort = format(kstDate, 'M/dd', { locale: ko })
  const dateFull = format(kstDate, 'M월 d일(E) HH:mm', { locale: ko })
  const title = `[초대장] ${dateShort} ${event.title}`
  const description = `${dateFull} | ${event.location_name || '장소 추후 공지'} | ${event.church_name}`
  const imageUrl = event.image_url || 'https://v0-christian-diary.vercel.app/og-image.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: event.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { originalId, index } = resolveEventInfo(params.id)
  const event = await fetchEventById(originalId)

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-slate-900 text-xl font-extrabold mb-2 font-modern">이벤트를 찾을 수 없습니다</h2>
        <Link href="/" className="text-brand font-bold hover:underline underline-offset-4 tracking-tight">홈으로 돌아가기</Link>
      </div>
    )
  }

  // 가상 일정인 경우 날짜 정보를 덮어씌움
  const adjustedEvent = { ...event }
  if (index > 0) {
    const actualStartDate = getRecurringDate(event.start_at, index, event.recurrence_rule || 'weekly')
    adjustedEvent.start_at = actualStartDate.toISOString()
    
    if (event.end_at) {
      const actualEndDate = getRecurringDate(event.end_at, index, event.recurrence_rule || 'weekly')
      adjustedEvent.end_at = actualEndDate.toISOString()
    }
  }

  return <EventDetailClient initialEvent={adjustedEvent} eventId={originalId} />
}
