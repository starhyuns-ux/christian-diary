'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchEventById, joinEvent, leaveEvent } from '@/lib/events'
import { Event, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG } from '@/types'
import { MapPin, Calendar, Users, Wallet, Share2, ChevronLeft, Building, Globe, Info, Loader2, CheckCircle2, CalendarPlus, MessageCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CategoryBadge from '@/components/ui/CategoryBadge'
import toast from 'react-hot-toast'
import { getGoogleCalendarUrl } from '@/lib/utils'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setLoading(true)
    const [eventData, { data: { user } }] = await Promise.all([
      fetchEventById(params.id),
      supabase.auth.getUser()
    ])

    if (eventData) {
      setEvent(eventData)
      if (user) {
        setUserId(user?.id)
        // 참가 여부 확인
        const { data } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', params.id)
          .eq('user_id', user?.id)
          .eq('status', 'confirmed')
          .single()
        setIsJoined(!!data)
      }
    }
    setLoading(false)
  }

  const handleJoinAction = async () => {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      router.push(`/login?next=/events/${params.id}`)
      return
    }

    if (isJoined) {
      if (!confirm('참가 신청을 취소하시겠습니까?')) return
      setJoining(true)
      const ok = await leaveEvent(params.id, userId)
      if (ok) {
        setIsJoined(false)
        toast.success('참가 신청이 취소되었습니다')
        loadData() // 인원 수 갱신
      }
    } else {
      if (event?.max_participants && (event.participant_count || 0) >= event.max_participants) {
        toast.error('정원이 초과되었습니다')
        return
      }
      setJoining(true)
      const ok = await joinEvent(params.id, userId)
      if (ok) {
        setIsJoined(true)
        toast.success('참가 신청이 완료되었습니다! 🙌')
        loadData() // 인원 수 갱신
      }
    }
    setJoining(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('링크가 복사되었습니다')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="h-96 skeleton rounded-3xl" />
        <div className="space-y-4">
          <div className="h-10 w-full skeleton rounded-xl" />
          <div className="h-32 w-full skeleton rounded-xl" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-slate-900 text-xl font-extrabold mb-2 font-modern">이벤트를 찾을 수 없습니다</h2>
        <Link href="/" className="text-brand font-bold hover:underline underline-offset-4 tracking-tight">홈으로 돌아가기</Link>
      </div>
    )
  }

  const startDate = parseISO(event.start_at)
  const endDate = parseISO(event.end_at)
  const isFull = event.max_participants != null && (event.participant_count || 0) >= event.max_participants
  const hasEnded = new Date() > endDate

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 animate-fade-in">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 hover:text-brand font-bold text-sm transition-all mb-8 group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
        {t('list')} {t('events')}
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cover Image Placeholder or Category Header */}
          <div className="relative aspect-video rounded-3xl overflow-hidden glass border border-slate-200 flex items-center justify-center bg-slate-50 shadow-sm">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center group">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 border border-slate-200 group-hover:scale-105 transition-transform shadow-sm">
                  <Calendar className="w-10 h-10 text-brand" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{CATEGORY_CONFIG[event.category].label}</p>
              </div>
            )}
            <div className="absolute top-6 left-6">
              <CategoryBadge category={event.category} size="md" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="glass rounded-3xl p-6 sm:p-10 border border-slate-200">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-6 sm:mb-8 leading-tight font-modern tracking-tight break-keep">
              {event.title}
            </h1>
            
            <div className="prose prose-slate max-w-none mb-8 sm:mb-10 text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base break-keep">
              {event.description || '...'}
            </div>

            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
              >
                <Share2 className="w-4 h-4" />
                {t('share')}
              </button>
              <a 
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand/5 border border-brand/20 text-brand font-bold hover:bg-brand/10 transition-all text-sm"
              >
                <CalendarPlus className="w-4 h-4" />
                {t('addToCalendar')}
              </a>
            </div>
          </div>

          {/* Host Info */}
          <div className="glass rounded-3xl p-6 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-slate-200 overflow-hidden bg-white p-1 flex items-center justify-center shadow-sm">
                {event.host?.avatar_url ? (
                  <img src={event.host.avatar_url} alt={event.host.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Building className="w-6 h-6 text-brand" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-brand uppercase tracking-widest mb-1">{t('host')}</p>
                <p className="text-slate-900 font-bold text-lg break-keep">
                  {event.church_name}
                  {event.denomination && <span className="text-slate-400 font-bold ml-2 text-sm">· {event.denomination}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl sticky top-24">
            <div className="space-y-6">
              {/* Timing */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/5">
                  <Calendar className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('schedule')}</p>
                  <p className="text-slate-900 text-base font-bold">
                    {format(startDate, 'yyyy.MM.dd')}
                  </p>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">
                    {format(startDate, 'HH:mm')} ~ {format(endDate, 'HH:mm')}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center shrink-0 border border-amber-500/5">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('location')}</p>
                  <p className="text-slate-900 text-base font-bold truncate break-keep">
                    {event.location_name || '...'}
                  </p>
                  {event.location_address && (
                    <p className="text-slate-500 text-sm font-medium truncate mt-0.5">{event.location_address}</p>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/5">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('participants')}</p>
                  <div className="flex items-center justify-between text-base mb-2">
                    <span className="text-slate-900 font-bold">
                      {event.participant_count || 0} / {event.max_participants || '∞'}
                    </span>
                    {isFull && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-extrabold">FULL</span>}
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${event.max_participants ? Math.min(100, ((event.participant_count || 0) / event.max_participants) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fee */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/5">
                  <Wallet className="w-6 h-6 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('fee')}</p>
                  <p className="text-slate-900 text-2xl font-extrabold">
                    {event.fee === 0 ? <span className="text-emerald-600">{t('free')}</span> : `${event.fee.toLocaleString()}${language === 'ko' ? '원' : 'KRW'}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleJoinAction}
                  disabled={joining || (!isJoined && isFull)}
                  className={`w-full py-4 rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95 text-base ${
                    isJoined 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200/50' 
                      : isFull 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-slate-900 text-white hover:bg-black shadow-slate-200/50 hover:-translate-y-1'
                  }`}
                >
                  {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : isJoined ? (
                    <>{t('joined')} <CheckCircle2 className="w-5 h-5" /></>
                  ) : isFull ? t('full') : t('join')}
                </button>

                <button 
                  onClick={() => toast.success(`${event.church_name} ${t('inquiryHost')} (TODO)`)}
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('inquiryHost')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Reviews */}
        <div className="lg:col-span-3">
          {hasEnded ? (
            <div className="glass rounded-3xl p-8 sm:p-10 border border-slate-200 mt-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight">{t('reviews')}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">{t('reviews')} - {event.title}</p>
                </div>
                {isJoined && (
                   <button className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all">
                     {t('writeReview')}
                   </button>
                )}
              </div>
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No reviews yet.</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 p-10 bg-brand/5 rounded-3xl border border-brand/5 text-center">
              <p className="text-brand-700 font-bold">Registration is open! Join us. 👋</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
