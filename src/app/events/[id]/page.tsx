import { Metadata } from 'next'
import { fetchEventById } from '@/lib/events'
import EventDetailClient from './EventDetailClient'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toKST } from '@/lib/utils'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await fetchEventById(params.id)

  if (!event) {
    return {
      title: '모임을 찾을 수 없습니다 - 크리스천다이어리',
    }
  }

  const kstDate = toKST(event.start_at)
  const dateShort = format(kstDate, 'M/dd', { locale: ko })
  const dateFull = format(kstDate, 'M월 d일(E) HH:mm', { locale: ko })
  const title = `[초대장] ${dateShort} ${event.title}`
  const description = `${dateFull} | ${event.location_name || '장소 추후 공지'} | ${event.church_name}`
  const imageUrl = event.image_url || 'https://v0-christian-diary.vercel.app/og-image.png' // 기본 이미지 경로 (필요시 교체)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
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
  const event = await fetchEventById(params.id)

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-slate-900 text-xl font-extrabold mb-2 font-modern">이벤트를 찾을 수 없습니다</h2>
        <Link href="/" className="text-brand font-bold hover:underline underline-offset-4 tracking-tight">홈으로 돌아가기</Link>
      </div>
    )
  }

  return <EventDetailClient initialEvent={event} eventId={params.id} />
}
