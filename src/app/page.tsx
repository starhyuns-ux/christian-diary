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
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-500/30 text-brand-300 text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-400 inline-block animate-pulse" />
          신앙 공동체 커뮤니티 캘린더
        </div>
        <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-3 text-glow">
          크리스천다이어리
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                  active
                    ? config.className + ' scale-105 shadow-lg'
                    : 'glass border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }} />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Region + View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="pl-7 pr-3 py-2 rounded-lg glass border border-white/10 text-sm text-slate-300 bg-transparent appearance-none cursor-pointer hover:border-brand-500/50 transition-colors focus:outline-none focus:border-brand-500"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-slate-900">{r}</option>
              ))}
            </select>
          </div>
          <div className="flex glass rounded-lg border border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              캘린더
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
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
      <section className="mt-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            {viewMode === 'list' ? '전체 이벤트' : '다가오는 일정'}
            {!loading && (
              <span className="text-sm font-normal text-slate-500 ml-1">
                ({events.length}개)
              </span>
            )}
          </h2>
          <Link
            href="/events"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
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
