'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchMyJoinedEvents, fetchMyHostedEvents } from '@/lib/events'
import { Event } from '@/types'
import { User, Mail, Calendar, LayoutGrid, Clock, ChevronRight, Settings, LogOut, ShieldCheck, Building } from 'lucide-react'
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
      <div className="glass-strong rounded-3xl p-6 sm:p-10 border border-white/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] -z-10 rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-brand-500/20 overflow-hidden bg-brand-800 shadow-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-brand-300" />
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-brand-600 border-2 border-slate-900 flex items-center justify-center hover:bg-brand-500 transition-colors">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-white">{displayName}</h1>
              {profile?.is_admin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-bold w-fit mx-auto md:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  관리자
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {user.email}
              </span>
              {profile?.church_name && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> {profile.church_name}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all ml-auto"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('joined')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
              activeTab === 'joined'
                ? 'bg-brand-600/20 border border-brand-500/30 text-white'
                : 'glass border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">신청한 모임</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5">{joinedEvents.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('hosted')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
              activeTab === 'hosted'
                ? 'bg-brand-600/20 border border-brand-500/30 text-white'
                : 'glass border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5" />
              <span className="font-medium">주최한 모임</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5">{hostedEvents.length}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'joined' ? '내가 신청한 모임' : '내가 주최한 모임'}
            </h2>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {(activeTab === 'joined' ? joinedEvents : hostedEvents).length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border border-white/5">
              <p className="text-5xl mb-4">🕊️</p>
              <p className="text-slate-400">모임이 없습니다.</p>
              {activeTab === 'hosted' && (
                <button
                  onClick={() => router.push('/events/create')}
                  className="mt-4 text-brand-400 hover:underline font-medium"
                >
                  첫 번째 모임 만들기 →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'joined' ? joinedEvents : hostedEvents).map(event => (
                <div key={event.id} className="relative group">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
