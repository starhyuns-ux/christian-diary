'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import { EventCategory, CATEGORY_CONFIG, Event, REGIONS } from '@/types'
import { fetchApprovedEvents } from '@/lib/events'
import { Plus, MapPin, Calendar, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import EventCard from '@/components/events/EventCard'

const CalendarView = dynamic(() => import('@/components/calendar/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] skeleton rounded-2xl" />
  ),
})

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategories, setActiveCategories] = useState<EventCategory[]>([])
  const [selectedRegion, setSelectedRegion] = useState('전국')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const data = await fetchApprovedEvents({
      category: activeCategories.length > 0 ? activeCategories : undefined,
      region: selectedRegion,
    })
    setEvents(data)
    setLoading(false)
  }, [activeCategories, selectedRegion])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-brand/5 border border-brand/10 text-brand text-xs font-bold mb-6 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block animate-pulse" />
          신앙 공동체 커뮤니티 캘린더
        </div>
        <h1 className="font-modern text-4xl sm:text-6xl font-extrabold text-slate-900 mb-5 tracking-tight">
          크리스천다이어리
        </h1>
        <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          강의, 소모임, 기도회, 예배…{' '}
          <br className="sm:hidden" />
          모든 신앙 일정을 한 곳에서 나누세요
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 flex-1">
          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
            const config = CATEGORY_CONFIG[cat]
            const active = activeCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                  active
                    ? config.className + ' scale-105 shadow-md -translate-y-0.5'
                    : 'bg-white border-black/5 text-slate-500 hover:border-brand/20 hover:text-brand shadow-sm'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.dotColor }} />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Region + View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold text-slate-700 appearance-none cursor-pointer hover:border-brand/30 transition-all focus:outline-none shadow-sm"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-white text-slate-900">{r}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              캘린더
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              목록
            </button>
          </div>
          <button
            onClick={loadEvents}
            className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="glass rounded-2xl p-4 sm:p-6 border border-white/10 mb-8">
          {loading ? (
            <div className="h-[500px] skeleton rounded-xl" />
          ) : (
            <CalendarView events={events} />
          )}
        </div>
      )}

      {/* Event Cards */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 font-modern">
            <Calendar className="w-6 h-6 text-brand" />
            {viewMode === 'list' ? '전체 이벤트' : '다가오는 일정'}
            {!loading && (
              <span className="text-sm font-bold text-slate-400 ml-1">
                {events.length}
              </span>
            )}
          </h2>
          <Link
            href="/events"
            className="text-sm font-bold text-brand hover:underline underline-offset-4"
          >
            전체보기 →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 skeleton rounded-2xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🕊️</p>
            <p className="text-slate-400 font-medium mb-1">등록된 일정이 없습니다</p>
            <p className="text-slate-600 text-sm mb-6">첫 번째 모임을 등록해보세요</p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              이벤트 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Mobile FAB */}
      <Link
        href="/events/create"
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl glow-brand z-50 hover:scale-110 transition-transform duration-200"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>
    </div>
  )
}
