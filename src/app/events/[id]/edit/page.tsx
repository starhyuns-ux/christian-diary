'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, uploadImage } from '@/lib/supabase'
import { fetchEventById, updateEvent } from '@/lib/events'
import { EventCategory, LocationType, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG, REGIONS, PLATFORM_FEE_RATE } from '@/types'
import { CalendarDays, MapPin, Users, Wallet, ChevronRight, Info, Loader2, Image as ImageIcon, Upload, X, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { format } from 'date-fns'

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

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'small_group' as EventCategory,
    start_at: '',
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
    external_link: '',
  })

  useEffect(() => {
    loadEvent()
  }, [params.id])

  const loadEvent = async () => {
    setFetching(true)
    const event = await fetchEventById(params.id)
    if (event) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== event.host_id) {
        toast.error('권한이 없습니다')
        router.push('/')
        return
      }

      setForm({
        title: event.title,
        description: event.description,
        category: event.category,
        start_at: format(new Date(event.start_at), "yyyy-MM-dd'T'HH:mm"),
        location_type: event.location_type,
        location_name: event.location_name || '',
        location_address: event.location_address || '',
        location_url: event.location_url || '',
        max_participants: event.max_participants?.toString() || '',
        fee: event.fee.toString(),
        fee_description: event.fee_description || '',
        is_recurring: event.is_recurring,
        recurrence_rule: event.recurrence_rule || '',
        region: event.region || '서울',
        denomination: event.denomination || '무교단/초교단',
        church_name: event.church_name || '',
        external_link: event.external_link || '',
      })
      setImagePreview(event.image_url)
    } else {
      toast.error('이벤트를 찾을 수 없습니다')
      router.push('/')
    }
    setFetching(false)
  }

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
    if (!form.title.trim()) return toast.error('제목을 입력해주세요')
    if (!form.start_at) return toast.error('날짜/시간을 입력해주세요')
    if (!form.church_name.trim()) return toast.error('주최 교회/단체명을 입력해주세요')

    setLoading(true)
    
    let imageUrl = imagePreview
    if (imageFile) {
      imageUrl = await uploadImage(imageFile)
      if (!imageUrl) {
        setLoading(false)
        return toast.error('이미지 업로드에 실패했습니다')
      }
    }

    const success = await updateEvent(params.id, {
      title: form.title,
      description: form.description,
      category: form.category,
      start_at: new Date(form.start_at).toISOString(),
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
      external_link: form.external_link || null,
      // 종료 시간 자동 설정 (시작 시간 + 1시간)
      end_at: new Date(new Date(form.start_at).getTime() + 60 * 60 * 1000).toISOString(),
    })
    setLoading(false)

    if (success) {
      toast.success('수정되었습니다')
      router.push(`/events/${params.id}`)
    } else {
      toast.error('수정에 실패했습니다')
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-slate-400 font-bold">이벤트 정보를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-slate-400 hover:text-brand font-bold text-sm transition-all">
          <ChevronLeft className="w-4 h-4" /> 뒤로가기
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-modern tracking-tight">이벤트 수정</h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Edit Your Event</p>
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

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">커버 이미지</label>
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-black/5 shadow-inner">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={removeImage} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors shadow-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand hover:bg-brand/5 transition-all cursor-pointer group shadow-sm bg-slate-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand mb-4" />
                      <p className="text-sm text-slate-600 font-bold">이미지 변경</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">카테고리 *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat]
                  const active = form.category === cat
                  return (
                    <button key={cat} type="button" onClick={() => update('category', cat)}
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
              {form.category === 'missionary_shelter' && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <div className="p-2 rounded-xl bg-white shadow-sm border border-emerald-50 text-xl">
                    🏠
                  </div>
                  <div className="space-y-1">
                    <p className="text-emerald-900 font-extrabold text-xs">선교사 쉼터 등록 안내</p>
                    <p className="text-emerald-700/80 text-[11px] font-medium leading-relaxed">
                      "집을 구하지 못한 선교사님들의 안식처"<br/>
                      사역 후 돌아오신 선교사님들이 평안히 쉴 수 있는 공간 정보를 나눠주세요. 
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">제목 *</label>
              <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">설명</label>
              <textarea 
                value={form.description} 
                onChange={e => update('description', e.target.value)} 
                rows={5}
                placeholder={form.category === 'missionary_shelter' 
                  ? "쉼터의 위치, 시설 안내(방 개수, 취사 가능 여부), 이용 대상 및 기간, 연락처 등을 자세히 적어주세요."
                  : "모임에 대해 자세히 설명해주세요"}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">주최 교회/단체 *</label>
                <input type="text" value={form.church_name} onChange={e => update('church_name', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">교단</label>
                <select value={form.denomination} onChange={e => update('denomination', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-700 font-bold focus:outline-none focus:border-brand/30 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm">
                  {DENOMINATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">시작 일시 *</label>
                <input type="datetime-local" value={form.start_at} onChange={e => update('start_at', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm [color-scheme:light]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={e => update('is_recurring', e.target.checked)} className="w-5 h-5 accent-brand rounded-lg" />
              <label htmlFor="recurring" className="text-sm text-slate-600 font-bold cursor-pointer">반복 일정 여부</label>
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
                        active ? 'bg-brand text-white border-brand shadow-lg scale-105' : 'bg-slate-50 border-black/5 text-slate-500 hover:border-brand/20'
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
                <input type="text" value={form.location_name} onChange={e => update('location_name', e.target.value)} placeholder="장소명"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
                <input type="text" value={form.location_address} onChange={e => update('location_address', e.target.value)} placeholder="도로명 주소"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            )}

            {(form.location_type === 'online' || form.location_type === 'hybrid') && (
              <input type="url" value={form.location_url} onChange={e => update('location_url', e.target.value)} placeholder="온라인 링크"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
              />
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">홈페이지 또는 오픈채팅 링크</label>
              <input type="url" value={form.external_link} onChange={e => update('external_link', e.target.value)} placeholder="예: https://open.kakao.com/..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">지역</label>
                <select value={form.region} onChange={e => update('region', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-700 font-bold focus:outline-none focus:border-brand/30 focus:bg-white appearance-none cursor-pointer transition-all shadow-sm">
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">모집 인원</label>
                <input type="number" value={form.max_participants} onChange={e => update('max_participants', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">모임 참가비 (원)</label>
              <div className="relative">
                <input type="number" value={form.fee} onChange={e => update('fee', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 text-xl font-extrabold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">원</span>
              </div>
            </div>

            {feeAmount > 0 && (
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">납부 방법 안내</label>
                <input type="text" value={form.fee_description} onChange={e => update('fee_description', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-10">
        <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-extrabold disabled:opacity-0 transition-all shadow-sm">이전으로</button>
        {step < 3 ? (
          <button type="button" onClick={() => setStep(s => Math.min(3, s + 1))} className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-brand text-white text-sm font-extrabold hover:shadow-2xl transition-all shadow-lg">다음 단계 <ChevronRight className="w-5 h-5" /></button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-12 py-4 rounded-2xl bg-slate-900 text-white text-sm font-extrabold hover:bg-black hover:shadow-2xl transition-all shadow-lg disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '수정 완료하기'}
          </button>
        )}
      </div>
    </div>
  )
}
