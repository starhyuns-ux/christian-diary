'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, uploadImage } from '@/lib/supabase'
import { createEvent } from '@/lib/events'
import { EventCategory, LocationType, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG, REGIONS, PLATFORM_FEE_RATE } from '@/types'
import { CalendarDays, MapPin, Users, Wallet, ChevronRight, Info, Loader2, Image as ImageIcon, Upload, X } from 'lucide-react'
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
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('파일 크기는 5MB 이하여야 합니다')
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

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
    
    // 1. 이미지 업로드 (있는 경우)
    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) {
        setLoading(false)
        return toast.error('이미지 업로드에 실패했습니다')
      }
    }

    // 2. 이벤트 정보 저장
    const result = await createEvent({
      host_id: user?.id,
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
      image_url: imageUrl,
      donation_status: 'pending',
      donation_proof_url: null,
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-modern tracking-tight">이벤트 등록</h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Post Your Event</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-12">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-md ${
                step === s
                  ? 'bg-brand text-white shadow-xl scale-110'
                  : step > s
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-black/5 text-slate-400 font-medium'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-black/5 p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] -z-10 rounded-full" />

        {/* ── STEP 1: 기본 정보 ── */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* 이미지 업로드 */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">커버 이미지</label>
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-black/5 shadow-inner">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group shadow-sm bg-slate-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-4 rounded-2xl bg-white group-hover:scale-110 transition-all shadow-sm mb-4">
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand" />
                      </div>
                      <p className="text-sm text-slate-600 font-bold font-modern">이미지 추가 (권장)</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium italic">PNG, JPG, WEBP (최대 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">카테고리 *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat]
                  const active = form.category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => update('category', cat)}
                      className={`flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-[11px] font-extrabold border transition-all duration-300 uppercase tracking-tight ${
                        active ? cfg.className + ' scale-105 shadow-lg -translate-y-1' : 'bg-slate-50 border-black/5 text-slate-500 hover:border-brand/20 hover:text-brand'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dotColor }} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => update('title', e.target.value)}
                placeholder="어떤 모임인가요?"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">설명</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="모임에 대해 자세히 설명해주세요"
                rows={5}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern resize-none"
              />
            </div>

            {/* 주최자 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">주최 교회/단체 *</label>
                <input
                  type="text"
                  value={form.church_name}
                  onChange={e => update('church_name', e.target.value)}
                  placeholder="예: 온누리교회"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">교단</label>
                <select
                  value={form.denomination}
                  onChange={e => update('denomination', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-700 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm font-modern"
                >
                  {DENOMINATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: 장소 & 일정 ── */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">시작 일시 *</label>
                <input type="datetime-local" value={form.start_at}
                  onChange={e => update('start_at', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm [color-scheme:light]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">종료 일시 *</label>
                <input type="datetime-local" value={form.end_at}
                  onChange={e => update('end_at', e.target.value)}
                  min={form.start_at}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm [color-scheme:light]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={form.is_recurring}
                onChange={e => update('is_recurring', e.target.checked)}
                className="w-5 h-5 accent-brand rounded-lg"
              />
              <label htmlFor="recurring" className="text-sm text-slate-600 font-bold cursor-pointer">
                매주 반복되는 일정한 모임인가요?
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">장소 유형</label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(LOCATION_TYPE_CONFIG) as LocationType[]).map(type => {
                  const cfg = LOCATION_TYPE_CONFIG[type]
                  const active = form.location_type === type
                  return (
                    <button key={type} type="button" onClick={() => update('location_type', type)}
                      className={`py-4 rounded-2xl text-[11px] font-extrabold border transition-all duration-300 shadow-sm ${
                        active
                          ? 'bg-brand text-white border-brand shadow-lg scale-105'
                          : 'bg-slate-50 border-black/5 text-slate-500 hover:border-brand/20'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {(form.location_type === 'offline' || form.location_type === 'hybrid') && (
              <div className="space-y-4">
                <input type="text" value={form.location_name}
                  onChange={e => update('location_name', e.target.value)}
                  placeholder="장소명 (예: 지하 1층 소예배실)"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
                <input type="text" value={form.location_address}
                  onChange={e => update('location_address', e.target.value)}
                  placeholder="도로명 주소"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
              </div>
            )}

            {(form.location_type === 'online' || form.location_type === 'hybrid') && (
              <input type="url" value={form.location_url}
                onChange={e => update('location_url', e.target.value)}
                placeholder="온라인 접속 링크 (Zoom, 유튜브 등)"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">지역</label>
                <select value={form.region} onChange={e => update('region', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-700 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm font-modern">
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">모집 인원</label>
                <input type="number" value={form.max_participants} min="1"
                  onChange={e => update('max_participants', e.target.value)}
                  placeholder="제한 없음"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: 모임비 & 기타 ── */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">모임 참가비 (원)</label>
              <div className="relative">
                <input type="number" value={form.fee} min="0" step="1000"
                  onChange={e => update('fee', e.target.value)}
                  placeholder="0 (무료)"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-xl font-extrabold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
              </div>
              {feeAmount > 0 && platformFee > 0 && (
                <div className="mt-4 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3 font-bold animate-in zoom-in-95">
                  <Info className="w-5 h-5 shrink-0 text-amber-600" />
                  <div>
                    강의 모임은 수익의 10% ({platformFeeAmount.toLocaleString()}원)를<br/>
                    플랫폼 운영을 위한 기부금으로 납부하시게 됩니다.
                  </div>
                </div>
              )}
            </div>

            {feeAmount > 0 && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">납부 방법 안내</label>
                <input type="text" value={form.fee_description}
                  onChange={e => update('fee_description', e.target.value)}
                  placeholder="예: 현장 납부 혹은 계좌이체"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm font-modern"
                />
              </div>
            )}

            <div className="p-6 rounded-3xl bg-brand/5 border border-brand/10 text-brand text-sm space-y-3 font-bold shadow-inner">
              <p className="flex items-center gap-2 text-base font-extrabold uppercase tracking-tight">📋 Registration Guide</p>
              <ul className="space-y-2 text-xs opacity-80">
                <li className="flex items-center gap-2">• 이단 및 비기독교 단체의 이벤트는 제한됩니다</li>
                <li className="flex items-center gap-2">• 제출 후 관리자 승인을 거쳐 24시간 내 게시됩니다</li>
                <li className="flex items-center gap-2">• 허위 정보 등록 시 활동에 제한을 받을 수 있습니다</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-extrabold hover:text-slate-900 hover:border-slate-300 hover:bg-white disabled:opacity-0 disabled:pointer-events-none transition-all shadow-sm"
        >
          이전으로
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-brand text-white text-sm font-extrabold hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all shadow-lg"
          >
            다음 단계 <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-slate-900 text-white text-sm font-extrabold hover:bg-black hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '모임 등록 신청하기'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
