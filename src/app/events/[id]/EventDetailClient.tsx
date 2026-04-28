'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchEventById, joinEvent, leaveEvent, deleteEvent, fetchEventParticipants } from '@/lib/events'
import { sendMessage } from '@/lib/messages'
import { Event, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG } from '@/types'
import { MapPin, Calendar, Users, Wallet, Share2, ChevronLeft, Building, Globe, Info, Loader2, CheckCircle2, CalendarPlus, MessageCircle, Edit, Trash2, Phone, X, User, BadgeCheck, QrCode, Copy, ExternalLink, Quote } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import CategoryBadge from '@/components/ui/CategoryBadge'
import toast from 'react-hot-toast'
import { getGoogleCalendarUrl, toKST } from '@/lib/utils'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import { PrivacyPolicyModal, TERMS_TEXTS } from '@/components/ui/PrivacyPolicy'

// 미니 달력 컴포넌트 추가
function MiniCalendar({ targetDate }: { targetDate: Date }) {
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth()
  const date = targetDate.getDate()
  
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= lastDate; i++) days.push(i)

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <div className="text-center mb-3">
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{year}년 {month + 1}월</p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(d => (
          <span key={d} className="text-[10px] font-bold text-slate-300 py-1">{d}</span>
        ))}
        {days.map((d, i) => {
          const isSelected = d === date
          return (
            <div 
              key={i} 
              className={`text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-110' 
                  : d ? 'text-slate-600 hover:bg-white hover:shadow-sm' : ''
              }`}
            >
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  initialEvent: Event
  eventId: string
}

export default function EventDetailClient({ initialEvent, eventId }: Props) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [event, setEvent] = useState<Event>(initialEvent)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryContent, setInquiryContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestConsent, setGuestConsent] = useState(false)
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' })

  useEffect(() => {
    initUser()
  }, [])

  const initUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      
      // 호스트인 경우 참가자 명단 조회
      if (user.id === initialEvent.host_id) {
        const participantsData = await fetchEventParticipants(eventId)
        setParticipants(participantsData || [])
      }

      // 참가 여부 확인
      const { data } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .single()
      setIsJoined(!!data)
    }
  }

  const loadData = async () => {
    const updated = await fetchEventById(eventId)
    if (updated) {
      setEvent(prev => ({
        ...updated,
        start_at: prev.start_at,
        end_at: prev.end_at
      }))
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleJoinAction = async () => {
    if (isJoined) {
      if (!confirm('참가 신청을 취소하시겠습니까?')) return
      setJoining(true)
      const ok = await leaveEvent(eventId, userId!)
      if (ok) {
        setIsJoined(false)
        toast.success('참가 신청이 취소되었습니다')
        loadData()
      }
      setJoining(false)
      return
    }

    if (event?.max_participants && (event.participant_count || 0) >= event.max_participants) {
      toast.error('정원이 초과되었습니다')
      return
    }

    if (!userId) {
      setShowGuestModal(true)
      return
    }

    setJoining(true)
    const ok = await joinEvent(eventId, userId)
    if (ok) {
      setIsJoined(true)
      toast.success('참가 신청이 완료되었습니다! 🙌')
      loadData()
    }
    setJoining(false)
  }

  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim() || !guestPhone.trim()) return toast.error('이름과 전화번호를 입력해주세요')
    if (!guestConsent) return toast.error('개인정보 수집 및 이용에 동의해주세요')

    setJoining(true)
    const ok = await joinEvent(eventId, null, { name: guestName, phone: guestPhone })
    if (ok) {
      toast.success('익명 참가 신청이 완료되었습니다! 🙌')
      setShowGuestModal(false)
      setGuestName('')
      setGuestPhone('')
      loadData()
    } else {
      toast.error('신청에 실패했습니다')
    }
    setJoining(false)
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 이벤트를 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) return
    
    const res = await deleteEvent(eventId)
    if (res.success) {
      toast.success('이벤트가 삭제되었습니다')
      router.push('/')
    } else {
      toast.error(res.error || '삭제에 실패했습니다')
    }
  }

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    if (!inquiryContent.trim()) return toast.error('문의 내용을 입력해주세요')

    setJoining(true)
    const ok = await sendMessage({
      sender_id: userId,
      receiver_id: event.host_id,
      event_id: event.id,
      content: inquiryContent
    })
    
    if (ok) {
      toast.success('문의가 전송되었습니다! 🙌')
      setShowInquiryModal(false)
      setInquiryContent('')
    } else {
      toast.error('전송에 실패했습니다')
    }
    setJoining(false)
  }

  const startDate = parseISO(event.start_at)
  const endDate = event.end_at ? parseISO(event.end_at) : null
  const isFull = event.max_participants != null && (event.participant_count || 0) >= event.max_participants
  const hasEnded = endDate ? (new Date() > endDate) : (new Date() > startDate)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 hover:text-brand font-bold text-sm transition-all group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
          {t('list')} {t('events')}
        </button>

        {userId === event.host_id && (
          <div className="flex items-center gap-2">
            <Link 
              href={`/events/${eventId}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-brand/10 hover:text-brand transition-all"
            >
              <Edit className="w-4 h-4" />
              수정
            </Link>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                <p className="text-slate-900 font-bold text-lg break-keep flex items-center gap-1.5">
                  {event.church_name}
                  {event.host?.is_verified && <BadgeCheck className="w-5 h-5 text-brand fill-brand/10" />}
                  {event.denomination && <span className="text-slate-400 font-bold ml-2 text-sm">· {event.denomination}</span>}
                </p>
                {event.host?.phone && (
                  <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand/60" />
                    {event.host.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl sticky top-24">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/5">
                  <Calendar className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('schedule')}</p>
                  <p className="text-slate-900 text-base font-bold">{format(startDate, 'yyyy.MM.dd')}</p>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">
                    {format(startDate, 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/5 flex items-center justify-center shrink-0 border border-amber-500/5">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('location')}</p>
                  <p className="text-slate-900 text-base font-bold truncate break-keep">{event.location_name || '...'}</p>
                  {event.location_address && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(event.location_address!);
                        toast.success('주소가 복사되었습니다!');
                      }}
                      className="text-slate-500 text-sm font-medium truncate mt-0.5 hover:text-brand hover:underline text-left w-full group transition-all"
                      title="주소 복사"
                    >
                      {event.location_address}
                      <Copy className="w-3 h-3 inline-block ml-1.5 opacity-0 group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/5">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{t('participants')}</p>
                  <div className="flex items-center justify-between text-base mb-2">
                    <span className="text-slate-900 font-bold">{event.participant_count || 0} / {event.max_participants || '∞'}</span>
                    {isFull && <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-extrabold">FULL</span>}
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${event.max_participants ? Math.min(100, ((event.participant_count || 0) / event.max_participants) * 100) : 0}%` }} />
                  </div>
                </div>
              </div>

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

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleJoinAction}
                  disabled={joining || (!isJoined && isFull)}
                  className={`w-full py-4 rounded-2xl font-extrabold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95 text-base ${
                    isJoined ? 'bg-emerald-500 text-white hover:bg-emerald-600' : isFull ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1'
                  }`}
                >
                  {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : isJoined ? (
                    <>{t('joined')} <CheckCircle2 className="w-5 h-5" /></>
                  ) : isFull ? t('full') : t('join')}
                </button>

                <button 
                  onClick={() => userId ? setShowInquiryModal(true) : toast.error('로그인이 필요합니다')}
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('inquiryHost')}
                </button>

                {event.external_link && (
                  <a 
                    href={event.external_link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-white border border-slate-200 text-brand hover:border-brand/30 hover:bg-brand/5 transition-all text-sm shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    홈페이지 / 오픈채팅 참여
                  </a>
                )}

                {/* Mini Calendar Section */}
                <div className="pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">모임 일정 확인</p>
                   <MiniCalendar targetDate={startDate} />
                   <p className="text-[10px] text-center text-slate-400 font-medium mt-3 italic">
                     * 해당 날짜에 모임이 진행됩니다.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {hasEnded ? (
            <div className="glass rounded-3xl p-8 sm:p-10 border border-slate-200 mt-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight">{t('reviews')}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">{t('reviews')} - {event.title}</p>
                </div>
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

        {userId === event.host_id && (
          <div className="lg:col-span-3 mt-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6 text-brand" />
                참가자 명단 ({participants.length})
              </h2>
            </div>
            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">이름</th>
                      <th className="py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">소속/연락처</th>
                      <th className="py-4 text-xs font-extrabold text-slate-400 uppercase tracking-widest">신청일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {participants.map((p) => (
                      <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                              {p.user?.avatar_url ? <img src={p.user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-300" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{p.guest_name || p.user?.name || '익명'}</p>
                              {p.user_id && <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">회원</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4"><p className="text-sm text-slate-600 font-medium">{p.guest_phone || p.user?.phone || p.user?.church_name || '-'}</p></td>
                        <td className="py-4"><p className="text-xs text-slate-400 font-bold">{format(parseISO(p.registered_at), 'yyyy.MM.dd HH:mm')}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">아직 신청한 참가자가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals ... */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up relative">
            <button onClick={() => setShowGuestModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center mx-auto mb-4 border border-brand/5">
                <Users className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight">익명 참가 신청</h3>
              <p className="text-slate-500 text-sm font-bold mt-2">이름과 연락처만으로 간편하게 신청하세요.</p>
            </div>
            <form onSubmit={handleGuestJoin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-1">성함</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="실명을 입력해 주세요" className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-1">연락처</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="010-0000-0000" className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm text-sm" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={joining || !guestConsent} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black hover:shadow-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40">
                  {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : '참가 신청하기'}
                </button>
              </div>
              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" id="guest-consent" checked={guestConsent} onChange={e => setGuestConsent(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand" />
                <label htmlFor="guest-consent" className="text-[10px] text-slate-400 font-medium">[필수] <button type="button" onClick={() => setModal({ isOpen: true, title: '비회원 개인정보 수집 동의', content: TERMS_TEXTS.guest })} className="underline">개인정보 수집 및 이용</button>에 동의합니다.</label>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInquiryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up relative">
            <button onClick={() => setShowInquiryModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center mx-auto mb-4 border border-brand/5">
                <MessageCircle className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight">주최자에게 문의</h3>
              <p className="text-slate-500 text-sm font-bold mt-2">{event.church_name}에 궁금한 점을 남겨주세요.</p>
            </div>
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <textarea required value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} placeholder="모임 장소, 준비물 등 궁금한 내용을 적어주세요." rows={5} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm text-sm resize-none" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={joining} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black hover:shadow-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                  {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : '문의 메시지 보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrivacyPolicyModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        content={modal.content}
      />
      {/* Share & QR Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-scale-up relative">
            <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 font-modern">소중한 분께 공유하기</h3>
              <p className="text-slate-500 text-xs font-bold mt-2">함께 지어져 가는 아름다운 공동체</p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-3xl p-6 flex flex-col items-center border border-slate-100">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-3">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} alt="Event QR Code" className="w-32 h-32" />
                </div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">모임 전용 QR 코드</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { 
                  const shareUrl = `${window.location.origin}${window.location.pathname}?v=${new Date().getTime()}`;
                  navigator.clipboard.writeText(shareUrl); 
                  toast.success('링크가 복사되었습니다!'); 
                }} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
                  <Copy className="w-5 h-5 text-slate-600" />
                  <span className="text-[11px] font-bold text-slate-700">링크 복사</span>
                </button>
                <button onClick={() => { 
                  if (navigator.share) { 
                    const kstDate = toKST(event.start_at);
                    const dateStr = format(kstDate, 'M/dd(E) HH:mm', { locale: ko });
                    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${new Date().getTime()}`;
                    navigator.share({ 
                      title: event.title, 
                      text: `[초대장] ${dateStr} ${event.title} 모임에 초대합니다!`, 
                      url: shareUrl
                    }); 
                  } else { 
                    toast.error('이 브라우저는 공유 기능을 지원하지 않습니다.'); 
                  } 
                }} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-brand/5 hover:bg-brand/10 transition-all border border-brand/10"><ExternalLink className="w-5 h-5 text-brand" /><span className="text-[11px] font-bold text-brand">공유하기</span></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
