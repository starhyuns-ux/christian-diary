'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchApprovedEvents } from '@/lib/events'
import { Event, CATEGORY_CONFIG, REGIONS } from '@/types'
import { Search, MapPin, Calendar, Filter, X, Loader2, ArrowRight } from 'lucide-react'
import EventCard from '@/components/events/EventCard'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''

  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState(queryParam)
  const [selectedRegion, setSelectedRegion] = useState('전국')
  const [activeTab, setActiveTab] = useState<'all' | 'lecture' | 'small_group' | 'prayer'>('all')

  const performSearch = useCallback(async () => {
    setLoading(true)
    const categoryFilter = activeTab === 'all' ? undefined : [activeTab as any]
    const data = await fetchApprovedEvents({
      category: categoryFilter,
      region: selectedRegion,
    })

    // 클라이언트 사이드 텍스트 검색 필터링
    const filtered = data.filter(event => {
      const matchText = (event.title + event.description + event.church_name).toLowerCase()
      return matchText.includes(searchTerm.toLowerCase())
    })

    setEvents(filtered)
    setLoading(false)
  }, [searchTerm, selectedRegion, activeTab])

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [performSearch])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 font-modern tracking-tight">모임 검색</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="이벤트 제목, 교회명, 내용 검색..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-black/5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/5 transition-all shadow-sm font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[140px]">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="w-full pl-10 pr-8 py-4 rounded-2xl glass border border-white/10 text-sm text-slate-300 bg-transparent appearance-none cursor-pointer focus:outline-none focus:border-brand-500/50"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r} className="bg-white text-slate-900">{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-black/5 pb-5">
        {['all', 'lecture', 'small_group', 'prayer'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-brand text-white shadow-md'
                : 'text-slate-500 hover:text-brand hover:bg-brand/5'
            }`}
          >
            {tab === 'all' ? '전체' : CATEGORY_CONFIG[tab as any].label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm">모임을 불러오는 중...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl border border-white/5">
            <p className="text-5xl mb-4">🌫️</p>
            <p className="text-slate-400 font-medium">검색 결과가 없습니다</p>
            <p className="text-slate-600 text-sm mt-1">다른 검색어를 입력하거나 필터를 조정해 보세요</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-slate-500 font-medium">
                총 <span className="text-brand font-extrabold">{events.length}</span>개의 모임을 찾았습니다
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Links / Suggestions */}
      {events.length === 0 && !loading && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-black/5 hover:border-brand/20 hover:shadow-xl transition-all cursor-pointer group" onClick={() => setActiveTab('lecture')}>
            <h3 className="text-slate-900 font-bold mb-2 flex items-center justify-between font-modern">
              성경 강해/세미나 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">준비된 신앙 강의를 통해 믿음의 지경을 넓혀보세요.</p>
          </div>
          <div className="p-6 rounded-2xl glass border border-white/5 hover:border-brand-500/20 transition-all cursor-pointer group" onClick={() => setActiveTab('small_group')}>
            <h3 className="text-white font-bold mb-2 flex items-center justify-between">
              교제 & 소모임 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">가까운 지역의 청년부, 직장인 신앙 공동체를 찾아보세요.</p>
          </div>
          <div className="p-6 rounded-2xl glass border border-white/5 hover:border-brand-500/20 transition-all cursor-pointer group" onClick={() => setActiveTab('prayer')}>
            <h3 className="text-white font-bold mb-2 flex items-center justify-between">
              기도회 & 찬양 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">함께 모여 뜨겁게 기도하고 찬양하는 자리에 초대합니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}
