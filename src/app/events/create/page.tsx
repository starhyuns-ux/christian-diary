'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createEvent } from '@/lib/events'
import { EventCategory, LocationType, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG, REGIONS, PLATFORM_FEE_RATE } from '@/types'
import { CalendarDays, MapPin, Users, Wallet, ChevronRight, Info, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CategoryBadge from '@/components/ui/CategoryBadge'

const DENOMINATIONS = [
  '대한예수교장로회(통합)',
  '대한예수교장로회(합동)',
  '한국기독교장로회',
  '기독교대한감리회',
  '기독교한국침례회',
  '기독교대한성결교회',
  '대한기독교하나님의성회(순복음)',
  '기독교대한하나님의성회',
  '한국복음주의교회연합',
  '무교단/초교단',
  '기타',
]

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: 기본정보, 2: 장소/일정, 3: 모임비/기타

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'small_group' as EventCategory,
    start_at: '',
    end_at: '',
    location_type: 'offline' as LocationType,
    location_name: '',
    location_address: '',
    location_url: '',
    max_participants: '',
    fee: '0',
    fee_description: '',
    is_recurring: false,
    recurrence_rule: '',
    region: '서울',
    denomination: '무교단/초교단',
    church_name: '',
  })

  const update = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const platformFee = PLATFORM_FEE_RATE[form.category]
  const feeAmount = parseInt(form.fee) || 0
  const platformFeeAmount = Math.round(feeAmount * platformFee)

  const handleSubmit = async () => {
    // 유효성 검사
    if (!form.title.trim()) return toast.error('제목을 입력해주세요')
    if (!form.start_at || !form.end_at) return toast.error('날짜/시간을 입력해주세요')
    if (new Date(form.start_at) >= new Date(form.end_at)) return toast.error('종료 시간이 시작 시간보다 늦어야 합니다')
    if (!form.church_name.trim()) return toast.error('주최 교회/단체명을 입력해주세요')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('로그인이 필요합니다')
      router.push('/login')
      return
    }

    setLoading(true)
    const result = await createEvent({
      host_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      start_at: new Date(form.start_at).toISOString(),
      end_at: new Date(form.end_at).toISOString(),
      location_type: form.location_type,
      location_name: form.location_name || null,
      location_address: form.location_address || null,
      location_url: form.location_url || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      fee: parseInt(form.fee) || 0,
      fee_description: form.fee_description || null,
      is_recurring: form.is_recurring,
      recurrence_rule: form.recurrence_rule || null,
      region: form.region,
      denomination: form.denomination,
      church_name: form.church_name,
      image_url: null,
    })
    setLoading(false)

    if (result) {
      toast.success('이벤트가 등록되었습니다! 관리자 검토 후 게시됩니다 🙏')
      router.push('/')
    } else {
      toast.error('등록에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">이벤트 등록</h1>
        <p className="text-slate-500 text-sm">관리자 검토 후 게시됩니다 (보통 24시간 이내)</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                step === s
                  ? 'bg-brand-600 text-white glow-brand'
                  : step > s
                  ? 'bg-brand-800 text-brand-300'
                  : 'glass border border-white/10 text-slate-500'
              }`}
            >
              {s}
            </button>
            {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-brand-600' : 'bg-white/10'}`} />}
          </div>
        ))}
        <span className="ml-2 text-slate-500 text-sm">
          {step === 1 ? '기본 정보' : step === 2 ? '장소 & 일정' : '모임비 & 기타'}
        </span>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">

        {/* ── STEP 1: 기본 정보 ── */}
        {step === 1 && (
          <>
            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">카테고리 *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat]
                  const active = form.category === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => update('category', cat)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        active ? cfg.className + ' scale-[1.02]' : 'glass border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dotColor }} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="이벤트 제목을 입력하세요"
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60 transition-colors"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">설명</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="이벤트에 대해 자유롭게 소개해주세요"
                rows={4}
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60 transition-colors resize-none"
              />
            </div>

            {/* 교회/단체 + 교단 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">주최 교회/단체 *</label>
                <input
                  type="text"
                  value={form.church_name}
                  onChange={e => update('church_name', e.target.value)}
                  placeholder="예: 온누리교회"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">교단</label>
                <select
                  value={form.denomination}
                  onChange={e => update('denomination', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-slate-300 bg-transparent text-sm focus:outline-none focus:border-brand-500/60 transition-colors"
                >
                  {DENOMINATIONS.map(d => (
                    <option key={d} value={d} className="bg-slate-900">{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: 장소 & 일정 ── */}
        {step === 2 && (
          <>
            {/* 날짜/시간 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">시작 *</label>
                <input type="datetime-local" value={form.start_at}
                  onChange={e => update('start_at', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/60 transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">종료 *</label>
                <input type="datetime-local" value={form.end_at}
                  onChange={e => update('end_at', e.target.value)}
                  min={form.start_at}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500/60 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* 반복 */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10">
              <input type="checkbox" id="recurring" checked={form.is_recurring}
                onChange={e => update('is_recurring', e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              <label htmlFor="recurring" className="text-sm text-slate-300 cursor-pointer">
                반복 일정 (매주 소모임 등)
              </label>
            </div>

            {/* 장소 유형 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">장소 유형</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(LOCATION_TYPE_CONFIG) as LocationType[]).map(type => {
                  const cfg = LOCATION_TYPE_CONFIG[type]
                  return (
                    <button key={type} onClick={() => update('location_type', type)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.location_type === type
                          ? 'bg-brand-600/40 border-brand-500/50 text-white'
                          : 'glass border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 오프라인/하이브리드 장소 */}
            {(form.location_type === 'offline' || form.location_type === 'hybrid') && (
              <div className="space-y-3">
                <input type="text" value={form.location_name}
                  onChange={e => update('location_name', e.target.value)}
                  placeholder="장소명 (예: 온누리교회 대강당)"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
                />
                <input type="text" value={form.location_address}
                  onChange={e => update('location_address', e.target.value)}
                  placeholder="주소 (예: 서울시 서초구 방배로)"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
                />
              </div>
            )}

            {/* 온라인 링크 */}
            {(form.location_type === 'online' || form.location_type === 'hybrid') && (
              <input type="url" value={form.location_url}
                onChange={e => update('location_url', e.target.value)}
                placeholder="온라인 참가 링크 (Zoom, YouTube 등)"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
              />
            )}

            {/* 지역 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">지역</label>
                <select value={form.region} onChange={e => update('region', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-slate-300 bg-transparent text-sm focus:outline-none focus:border-brand-500/60">
                  {REGIONS.map(r => (
                    <option key={r} value={r} className="bg-slate-900">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">최대 인원</label>
                <input type="number" value={form.max_participants} min="1"
                  onChange={e => update('max_participants', e.target.value)}
                  placeholder="제한 없음"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
                />
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: 모임비 & 기타 ── */}
        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                모임비 (원)
              </label>
              <input type="number" value={form.fee} min="0" step="1000"
                onChange={e => update('fee', e.target.value)}
                placeholder="0 (무료)"
                className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
              />
              {feeAmount > 0 && platformFee > 0 && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  강의는 모임비의 10% ({platformFeeAmount.toLocaleString()}원)를 플랫폼 후원비로 납부합니다
                </div>
              )}
            </div>

            {feeAmount > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">모임비 안내</label>
                <input type="text" value={form.fee_description}
                  onChange={e => update('fee_description', e.target.value)}
                  placeholder="예: 현장 납부 / 계좌이체 (국민 123-456-789 홍길동)"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/60"
                />
              </div>
            )}

            {/* 제출 안내 */}
            <div className="px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm space-y-1">
              <p className="font-medium">📋 등록 전 확인사항</p>
              <ul className="text-xs text-brand-400 space-y-0.5 list-disc list-inside">
                <li>이단 및 비기독교 단체는 등록이 제한됩니다</li>
                <li>관리자 검토 후 24시간 이내 게시됩니다</li>
                <li>허위 정보 등록 시 계정이 정지될 수 있습니다</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-5 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm font-medium hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← 이전
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-all glow-brand"
          >
            다음 <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 transition-all glow-brand disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '🙏 등록 신청'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
