'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchPendingEvents, approveEvent, rejectEvent, fetchDonationPendingEvents, verifyDonation } from '@/lib/events'
import { Event, CATEGORY_CONFIG } from '@/types'
import { ShieldCheck, Check, X, Clock, Loader2, Wallet, Building, Eye, CheckCircle2, RefreshCw, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import CategoryBadge from '@/components/ui/CategoryBadge'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [donationEvents, setDonationEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'events' | 'donations'>('events')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user?.id).single()
    if (!profile?.is_admin) { router.replace('/'); return }

    setIsAdmin(true)
    loadData()
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [pending, donations] = await Promise.all([
        fetchPendingEvents(),
        fetchDonationPendingEvents()
      ])
      setEvents(pending)
      setDonationEvents(donations)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    if (!confirm('이 이벤트를 승인하시겠습니까?')) return
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

  const handleVerifyDonation = async (eventId: string) => {
    if (!confirm('후원금 납부가 확인되었습니까?')) return
    setActionLoading(eventId + '_verify')
    const ok = await verifyDonation(eventId)
    setActionLoading(null)
    if (ok) {
      toast.success('후원금 확인이 완료되었습니다 🎉')
      setDonationEvents(prev => prev.filter(e => e.id !== eventId))
    } else {
      toast.error('처리 중 오류가 발생했습니다')
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shadow-sm border border-brand/5">
          <ShieldCheck className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-modern tracking-tight">관리자 대시보드</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Administrator Workspace</p>
        </div>
        <button 
          onClick={loadData} 
          className="ml-auto p-3 rounded-2xl bg-white border border-black/5 text-slate-400 hover:text-brand hover:border-brand/20 transition-all shadow-sm"
          title="새로고침"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm mb-10 w-fit">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'events' ? 'bg-brand text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          이벤트 승인 ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'donations' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          후원금 검토 ({donationEvents.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-3xl" />
          ))}
        </div>
      ) : activeTab === 'events' ? (
        events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-sm">
            <p className="text-5xl mb-4">✨</p>
            <p className="text-slate-900 font-bold text-lg">대기 중인 이벤트가 없습니다</p>
            <p className="text-slate-500 text-sm mt-1">모든 검토가 완료되었습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => {
              const start = parseISO(event.start_at)
              return (
                <div key={event.id} className="bg-white rounded-3xl border border-black/5 p-6 shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <CategoryBadge category={event.category} />
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          {format(parseISO(event.created_at), 'M월 d일 HH:mm 등록', { locale: ko })}
                        </span>
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg leading-snug mb-2 font-modern">{event.title}</h3>
                      <div className="flex items-center gap-4 flex-wrap text-slate-500 text-xs font-bold font-modern">
                         <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-brand" /> {event.church_name}</span>
                         <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand" /> {format(start, 'M/d(E) HH:mm', { locale: ko })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleApprove(event.id)} 
                        disabled={!!actionLoading} 
                        className="px-6 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-extrabold flex items-center gap-2 hover:bg-emerald-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading === event.id + '_approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        승인
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* ── DONATION TAB CONTENT ── */
        donationEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-sm">
            <p className="text-5xl mb-4">💎</p>
            <p className="text-slate-900 font-bold text-lg">검토할 후원 확인증이 없습니다</p>
            <p className="text-slate-500 text-sm mt-1">평화로운 관리자 대시보드입니다</p>
          </div>
        ) : (
          <div className="space-y-5">
            {donationEvents.map(event => (
              <div key={event.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden p-6 flex flex-col md:flex-row gap-8 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="w-full md:w-56 aspect-[1/1] rounded-2xl overflow-hidden bg-slate-100 border border-black/5 group relative shadow-inner shrink-0">
                  {event.donation_proof_url ? (
                    <>
                      <img src={event.donation_proof_url} alt="Proof" className="w-full h-full object-cover" />
                      <a href={event.donation_proof_url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-brand/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Eye className="w-8 h-8 text-white" />
                      </a>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">No Image</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between pt-1">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-slate-900 text-xl font-extrabold font-modern leading-tight pr-4">{event.title}</h3>
                      <span className="shrink-0 bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-tighter">
                        {(event.fee * 0.1).toLocaleString()}원 납부
                      </span>
                    </div>
                    <div className="space-y-2 mt-2">
                       <p className="text-sm text-slate-600 flex items-center gap-2 font-bold font-modern">
                         <Building className="w-4 h-4 text-brand" /> {event.church_name}
                       </p>
                       <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                         <Wallet className="w-4 h-4 text-amber-500" /> 총 수익: {event.fee.toLocaleString()}원 (플랫폼 후원 10%)
                       </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => handleVerifyDonation(event.id)}
                      disabled={!!actionLoading}
                      className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-brand text-white text-sm font-extrabold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === event.id + '_verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      후원금 확인 완료
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
