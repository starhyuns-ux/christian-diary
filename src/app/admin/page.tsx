'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchPendingEvents, approveEvent, rejectEvent } from '@/lib/events'
import { Event, CATEGORY_CONFIG } from '@/types'
import { ShieldCheck, Check, X, Clock, ChevronDown, ChevronUp, Loader2, MapPin, Calendar, Wallet, Building } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import CategoryBadge from '@/components/ui/CategoryBadge'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) { router.replace('/'); return }

    setIsAdmin(true)
    loadPending()
  }

  const loadPending = async () => {
    setLoading(true)
    const data = await fetchPendingEvents()
    setEvents(data)
    setLoading(false)
  }

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId + '_approve')
    const ok = await approveEvent(eventId)
    setActionLoading(null)
    if (ok) {
      toast.success('이벤트가 승인되었습니다 ✓')
      setEvents(prev => prev.filter(e => e.id !== eventId))
    } else {
      toast.error('승인 처리 중 오류가 발생했습니다')
    }
  }

  const handleReject = async (eventId: string) => {
    if (!rejectNote.trim()) { toast.error('거절 사유를 입력해주세요'); return }
    setActionLoading(eventId + '_reject')
    const ok = await rejectEvent(eventId, rejectNote)
    setActionLoading(null)
    if (ok) {
      toast.success('이벤트가 거절되었습니다')
      setEvents(prev => prev.filter(e => e.id !== eventId))
      setRejectNote('')
      setExpanded(null)
    } else {
      toast.error('거절 처리 중 오류가 발생했습니다')
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/30 to-gold-600/20 border border-gold-500/30 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
          <p className="text-slate-500 text-sm">이벤트 승인 검토</p>
        </div>
        <button onClick={loadPending} className="ml-auto px-4 py-2 rounded-lg glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors">
          새로고침
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-4 border border-white/10 text-center">
          <p className="text-3xl font-bold text-gold-400">{events.length}</p>
          <p className="text-slate-500 text-sm mt-1">대기 중</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/10 text-center">
          <p className="text-3xl font-bold text-emerald-400">–</p>
          <p className="text-slate-500 text-sm mt-1">오늘 승인</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/10 text-center">
          <p className="text-3xl font-bold text-red-400">–</p>
          <p className="text-slate-500 text-sm mt-1">오늘 거절</p>
        </div>
      </div>

      {/* Pending events */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/10">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-white font-medium">대기 중인 이벤트가 없습니다</p>
          <p className="text-slate-500 text-sm mt-1">모든 이벤트가 처리되었습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => {
            const isExpanded = expanded === event.id
            const start = parseISO(event.start_at)
            return (
              <div key={event.id} className="glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-300">
                {/* Event header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CategoryBadge category={event.category} />
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.created_at), 'M월 d일 HH:mm 등록', { locale: ko })}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-base leading-snug line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Building className="w-3 h-3" />
                          {event.church_name} {event.denomination && `· ${event.denomination}`}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {format(start, 'M/d(E) HH:mm', { locale: ko })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {event.region}
                        </span>
                        {event.fee > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gold-400">
                            <Wallet className="w-3 h-3" />
                            {event.fee.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                      >
                        {actionLoading === event.id + '_approve'
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Check className="w-4 h-4" />
                        }
                        승인
                      </button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : event.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all"
                      >
                        <X className="w-4 h-4" />
                        거절
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Description preview */}
                  {event.description && (
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2">{event.description}</p>
                  )}
                </div>

                {/* Reject panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 bg-red-500/5 animate-slide-up">
                    <label className="block text-sm text-red-300 font-medium mb-2">거절 사유 *</label>
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      placeholder="거절 이유를 입력하세요 (주최자에게 전달됩니다)"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-red-500/20 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-red-500/40 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => { setExpanded(null); setRejectNote('') }}
                        className="px-4 py-2 rounded-lg glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors">
                        취소
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/70 border border-red-500/30 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        {actionLoading === event.id + '_reject' && <Loader2 className="w-4 h-4 animate-spin" />}
                        거절 확정
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
