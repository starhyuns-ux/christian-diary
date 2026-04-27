'use client'

export const dynamic = 'force-dynamic'

import nextDynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import { EventCategory, CATEGORY_CONFIG, Event, REGIONS } from '@/types'
import { fetchApprovedEvents } from '@/lib/events'
import { expandRecurringEvents } from '@/lib/utils'
import { getRandomVerse, BibleVerse } from '@/lib/bible'
import { Plus, MapPin, Calendar, Loader2, RefreshCw, Quote } from 'lucide-react'
import Link from 'next/link'
import EventCard from '@/components/events/EventCard'
import { useLanguage } from '@/lib/contexts/LanguageContext'
import ShareButton from '@/components/ui/ShareButton'

const CalendarView = nextDynamic(() => import('@/components/calendar/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] skeleton rounded-2xl" />
  ),
})

export default function HomePage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null)
  
  useEffect(() => {
    setDailyVerse(getRandomVerse())
  }, [])
  const [activeCategories, setActiveCategories] = useState<EventCategory[]>([])
  const [selectedRegion, setSelectedRegion] = useState('전국')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const eventListRef = useRef<HTMLDivElement>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const data = await fetchApprovedEvents({
      category: activeCategories.length > 0 ? activeCategories : undefined,
      region: selectedRegion,
    })
    // 반복 일정 확장 적용
    const expanded = expandRecurringEvents(data)
    setEvents(expanded)
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

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    // 작은 지연 후 스크롤 (렌더링 대기)
    setTimeout(() => {
      eventListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const { weeklyEvents, monthlyEvents, filteredEvents } = useMemo(() => {
    const today = calendarDate
    
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 })
    
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    const sortedAll = [...events].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    })

    const now = new Date()
    const weekly = sortedAll.filter(event => {
      const d = parseISO(event.start_at)
      const isInWeek = d >= weekStart && d <= weekEnd
      // 시작 시간으로부터 1시간이 지났는지 확인 (현재 < 시작+1시간)
      const isStillFresh = now.getTime() < (d.getTime() + 60 * 60 * 1000)
      return isInWeek && isStillFresh
    })

    const monthly = sortedAll.filter(event => {
      const d = parseISO(event.start_at)
      return d >= currentMonthStart && d <= currentMonthEnd
    })

    const filtered = selectedDate
      ? sortedAll.filter(event => format(parseISO(event.start_at), 'yyyy-MM-dd') === selectedDate)
      : sortedAll

    return { weeklyEvents: weekly, monthlyEvents: monthly, filteredEvents: filtered }
  }, [events, selectedDate, calendarDate])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with Daily Verse */}
      <section className="relative pt-8 pb-12 overflow-hidden mb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30">
          <div className="absolute top-0 left-10 w-72 h-72 bg-brand/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-brand/10 shadow-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-[9px] font-extrabold text-brand uppercase tracking-widest">오늘의 말씀</span>
          </div>
          
          {dailyVerse && (
            <div className="relative py-2 px-6 group inline-block text-left sm:text-center">
              <Quote className="absolute -top-4 -left-2 w-10 h-10 text-brand/5 -rotate-12 transition-transform group-hover:rotate-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug break-keep tracking-tight mb-3">
                "{dailyVerse.text}"
              </h2>
              <div className="flex items-center sm:justify-center gap-3">
                <p className="text-brand font-extrabold text-[10px] tracking-widest uppercase">{dailyVerse.reference}</p>
                <ShareButton 
                  title={`${dailyVerse.text} - ${dailyVerse.reference}`}
                  text="오늘의 말씀 묵상 나누기"
                  url="/"
                  className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-brand/10 hover:text-brand transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setActiveCategories([])}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
              activeCategories.length === 0
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border-black/5 text-slate-500 hover:border-brand/20'
            }`}
          >
            {t('all')}
          </button>
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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[120px]">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-white border border-black/5 text-sm font-bold text-slate-700 appearance-none cursor-pointer hover:border-brand/30 transition-all focus:outline-none shadow-sm"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-white text-slate-900">{r === '전국' ? t('all') : r}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-brand-600 text-white shadow-lg scale-105 z-10' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('calendar')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-brand-600 text-white shadow-lg scale-105 z-10' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('list')}
            </button>
          </div>
          <button
            onClick={loadEvents}
            className="p-2 rounded-lg glass border border-white/10 text-slate-400 hover:text-white transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="mb-8 w-full">
          {loading ? (
            <div className="h-[450px] skeleton rounded-[2rem]" />
          ) : (
            <CalendarView 
              events={events} 
              onDateClick={handleDateClick} 
              onDatesSet={setCalendarDate}
            />
          )}
        </div>
      )}

      {/* Hero (Reduced and moved down) */}
      <div className="text-center mb-14 animate-fade-in pt-8 pb-4 opacity-80 hover:opacity-100 transition-opacity">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand-700 text-xs font-bold mb-6 tracking-wide uppercase shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block animate-pulse" />
          {t('hero_badge')}
        </div>
        <h2 className="font-modern text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight break-keep">
          {t('hero_title')}
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed break-keep mb-8">
          {t('hero_desc')}
        </p>
        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ring-2 ring-brand-50 ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          우리 교회 모임/행사 무료로 등록하기
        </Link>
      </div>

      {/* Event Cards */}
      {/* Weekly Schedule Section */}
      {!selectedDate && viewMode === 'calendar' && (
        <section className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5 font-modern">
              <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-brand" />
              </div>
              주간 행사
              <span className="text-sm font-bold text-slate-400 ml-1">{weeklyEvents.length}</span>
            </h2>
          </div>
          {weeklyEvents.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-sm">이번 주에는 예정된 행사가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeklyEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Monthly / Filtered Events section */}
      <section className="mt-8 scroll-mt-20" ref={eventListRef}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 font-modern">
              <div className="w-10 h-10 rounded-2xl bg-slate-900/5 flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-900" />
              </div>
              {selectedDate 
                ? `${format(parseISO(selectedDate), 'M월 d일')} ${t('events')}`
                : viewMode === 'list' ? t('events') : '이번 달 행사'}
              {!loading && (
                <span className="text-sm font-bold text-slate-400 ml-1">
                  {selectedDate ? filteredEvents.length : monthlyEvents.length}
                </span>
              )}
            </h2>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-xs font-bold text-brand hover:text-brand-700 bg-brand/5 px-3 py-1.5 rounded-lg border border-brand/10 transition-all"
              >
                {t('all')} {t('list')} ✕
              </button>
            )}
          </div>
          <Link
            href="/events"
            className="text-sm font-bold text-brand hover:underline underline-offset-4"
          >
            전체보기 →
          </Link>
        </div>

        {loading ? (
          <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] w-[320px] h-64 skeleton rounded-2xl shrink-0" />
            ))}
          </div>
        ) : (selectedDate ? filteredEvents : monthlyEvents).length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-5xl mb-4">🕊️</p>
            <p className="text-slate-400 font-medium mb-1">
              {selectedDate ? `${format(parseISO(selectedDate), 'M월 d일')}에는 일정이 없습니다` : '이번 달에는 예정된 행사가 없습니다'}
            </p>
            <p className="text-slate-500 text-sm mb-6">첫 번째 모임을 등록해보세요</p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {t('createEvent')}
            </Link>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x items-stretch">
            {(selectedDate ? filteredEvents : monthlyEvents).map(event => (
              <div key={event.id} className="min-w-[280px] sm:min-w-[320px] w-[320px] snap-start shrink-0">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mobile FAB */}
      <Link
        href="/events/create"
        className="fixed bottom-6 right-6 sm:hidden flex items-center gap-2 px-5 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-2xl shadow-brand-500/40 z-50 hover:scale-105 transition-transform duration-200 border border-white/20"
      >
        <Plus className="w-5 h-5 text-white" />
        <span className="text-white font-bold text-sm">모임 등록</span>
      </Link>
    </div>
  )
}
