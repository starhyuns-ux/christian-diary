'use client'

import { useEffect, useState } from 'react'
import { fetchApprovedEvents } from '@/lib/events'
import { Event, CATEGORY_CONFIG, EventCategory } from '@/types'
import { Calendar, Filter, Search as SearchIcon, ChevronRight, Grid, List as ListIcon } from 'lucide-react'
import EventCard from '@/components/events/EventCard'
import Link from 'next/link'

export default function EventsListPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadEvents()
  }, [activeCategory])

  const loadEvents = async () => {
    setLoading(true)
    const data = await fetchApprovedEvents({
      category: activeCategory === 'all' ? undefined : [activeCategory],
    })
    setEvents(data)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-brand text-xs font-bold mb-3 uppercase tracking-wider">
            <Link href="/" className="hover:underline underline-offset-4">홈</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span>전체 이벤트</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-modern tracking-tight">모든 일정 보기</h1>
          <p className="text-slate-600 mt-2 font-medium">전국의 다양한 기독교 모임을 카테고리별로 확인하세요.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/search"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-black/5 text-slate-700 text-sm font-bold hover:text-brand hover:border-brand/30 transition-all shadow-sm"
          >
            <SearchIcon className="w-4 h-4" />
            검색하기
          </Link>
          <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-brand text-white shadow-md scale-105'
              : 'bg-white border border-black/5 text-slate-500 hover:text-brand hover:border-brand/20'
          }`}
        >
          전체
        </button>
        {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
          const cfg = CATEGORY_CONFIG[cat]
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                active
                  ? cfg.className + ' shadow-md scale-105'
                  : 'bg-white border border-black/5 text-slate-500 hover:text-brand hover:border-brand/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dotColor }} />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 skeleton rounded-2xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 glass rounded-3xl border border-white/5">
          <p className="text-4xl mb-4">🙌</p>
          <p className="text-slate-400">등록된 이벤트가 없습니다.</p>
          <p className="text-slate-600 text-sm mt-1">카테고리를 변경하거나 새로운 모임을 등록해 보세요!</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {events.map(event => (
            <div key={event.id} className={viewMode === 'list' ? "w-full" : ""}>
               {/* 
                  List mode uses the same EventCard for now but we could 
                  create a horizontal variant later. 
               */}
               <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
