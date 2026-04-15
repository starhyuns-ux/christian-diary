'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, uploadImage } from '@/lib/supabase'
import { fetchMyJoinedEvents, fetchMyHostedEvents, submitDonationProof } from '@/lib/events'
import { Event } from '@/types'
import { User, Mail, Calendar, LayoutGrid, Clock, ChevronRight, Settings, LogOut, ShieldCheck, Building, Wallet, Upload, CheckCircle2, History } from 'lucide-react'
import EventCard from '@/components/events/EventCard'
import { signOut } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [hostedEvents, setHostedEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'joined' | 'hosted'>('joined')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login?next=/profile')
      return
    }
    setUser(authUser)

    // Fetch user profile from DB
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setProfile(profileData)

    // Fetch events
    const [joined, hosted] = await Promise.all([
      fetchMyJoinedEvents(authUser.id),
      fetchMyHostedEvents(authUser.id)
    ])
    setJoinedEvents(joined)
    setHostedEvents(hosted)
    setLoading(false)
  }

  const handleUploadProof = async (eventId: string, file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) return toast.error('파일 크기는 5MB 이하여야 합니다')
      
      const loadingToast = toast.loading('확인증을 업로드 중입니다...')
      const publicUrl = await uploadImage(file, 'donation-proofs')
      
      if (!publicUrl) {
        toast.dismiss(loadingToast)
        return toast.error('업로드에 실패했습니다')
      }

      const ok = await submitDonationProof(eventId, publicUrl)
      toast.dismiss(loadingToast)

      if (ok) {
        toast.success('확인증이 제출되었습니다! 관리자 검토 후 승인됩니다 🙏')
        loadProfile() // 새로고침
      } else {
        toast.error('상세 정보 업데이트에 실패했습니다')
      }
    } catch (err) {
      console.error(err)
      toast.error('오류가 발생했습니다')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('로그아웃 되었습니다')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-48 skeleton rounded-3xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="md:col-span-2 h-96 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const displayName = profile?.name || user?.user_metadata?.full_name || '사용자'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 mb-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 blur-[120px] -z-10 rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-slate-300" />
                </div>
              )}
            </div>
            <button className="absolute bottom-1.5 right-1.5 w-10 h-10 rounded-full bg-brand border-4 border-white flex items-center justify-center hover:scale-110 transition-all shadow-lg">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-modern tracking-tight">{displayName}</h1>
              {profile?.is_admin && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-extrabold uppercase tracking-tight w-fit mx-auto md:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Administrator
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-x-8 gap-y-2 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand" /> {user.email}
              </span>
              {profile?.church_name && (
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand" /> {profile.church_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-3">
          <button
            onClick={() => setActiveTab('joined')}
            className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl transition-all shadow-sm border ${
              activeTab === 'joined'
                ? 'bg-brand text-white border-brand shadow-lg scale-[1.02]'
                : 'bg-white border-black/5 text-slate-500 hover:text-brand hover:bg-brand/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 font-bold" />
              <span className="font-extrabold text-sm">신청한 모임</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${activeTab === 'joined' ? 'bg-white/20' : 'bg-slate-100'}`}>{joinedEvents.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('hosted')}
            className={`w-full flex items-center justify-between px-6 py-4.5 rounded-2xl transition-all shadow-sm border ${
              activeTab === 'hosted'
                ? 'bg-brand text-white border-brand shadow-lg scale-[1.02]'
                : 'bg-white border-black/5 text-slate-500 hover:text-brand hover:bg-brand/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <LayoutGrid className="w-5 h-5 font-bold" />
              <span className="font-extrabold text-sm">주최한 모임</span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${activeTab === 'hosted' ? 'bg-white/20' : 'bg-slate-100'}`}>{hostedEvents.length}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-8 border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 font-modern tracking-tight">
              {activeTab === 'joined' ? '내가 신청한 모임' : '내가 주최한 모임'}
            </h2>
            <div className="h-0.5 flex-1 bg-slate-100 rounded-full" />
          </div>

          {(activeTab === 'joined' ? joinedEvents : hostedEvents).length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-black/5 shadow-sm">
              <p className="text-5xl mb-6">🕊️</p>
              <p className="text-slate-900 font-bold text-lg">내역이 없습니다</p>
              <p className="text-slate-500 text-sm mt-1">활동을 시작해 보세요!</p>
              {activeTab === 'hosted' && (
                <button
                  onClick={() => router.push('/events/create')}
                  className="mt-6 px-6 py-3 rounded-2xl bg-brand text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  첫 번째 모임 등록하기
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'joined' ? joinedEvents : hostedEvents).map(event => (
                <div key={event.id} className="space-y-3">
                  <div className="relative group">
                    <EventCard event={event} />
                    {activeTab === 'hosted' && (
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg border ${
                        event.status === 'approved' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          : event.status === 'pending'
                          ? 'bg-gold-500/20 text-gold-400 border-gold-500/20'
                          : 'bg-red-500/20 text-red-400 border-red-500/20'
                      }`}>
                        {event.status === 'approved' ? '게시 중' : event.status === 'pending' ? '검토 중' : '거절됨'}
                      </div>
                    )}
                  </div>

                  {activeTab === 'hosted' && event.category === 'lecture' && event.fee > 0 && event.status === 'approved' && (
                    <div className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          event.donation_status === 'verified' ? 'bg-emerald-50' : 'bg-amber-50'
                        }`}>
                          <Wallet className={`w-5 h-5 ${
                            event.donation_status === 'verified' ? 'text-emerald-600' : 'text-amber-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Platform Donation</p>
                          <p className="text-sm font-bold text-slate-900">
                            {event.donation_status === 'verified' 
                              ? '후원금 납부 완료 ✨' 
                              : event.donation_status === 'submitted'
                              ? '확인증 검토 중...'
                              : `미납: ${(event.fee * 0.1).toLocaleString()}원`}
                          </p>
                        </div>
                      </div>

                      {event.donation_status === 'pending' && (
                        <label className="cursor-pointer shrink-0">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all">
                            <Upload className="w-3.5 h-3.5" /> 확인증 올리기
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleUploadProof(event.id, file)
                            }}
                          />
                        </label>
                      )}

                      {event.donation_status === 'submitted' && (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/10 text-slate-400 text-xs font-medium">
                          <History className="w-3.5 h-3.5" /> 검토 대기 중
                        </div>
                      )}

                      {event.donation_status === 'verified' && (
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 확인 완료
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
