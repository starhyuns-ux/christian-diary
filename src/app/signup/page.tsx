'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, Mail, Lock, Phone, Building, MapPin, ShieldCheck, ChevronLeft, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { REGIONS } from '@/types'
import { PrivacyPolicyModal, TERMS_TEXTS } from '@/components/ui/PrivacyPolicy'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [consents, setConsents] = useState({ general: false, sensitive: false })
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' })
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    church_name: '',
    denomination: '',
    region: '전국'
  })

  const isFormValid = 
    formData.email && 
    formData.password.length >= 6 && 
    formData.name && 
    formData.phone && 
    formData.church_name && 
    formData.denomination && 
    formData.region && 
    consents.general && 
    consents.sensitive

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    try {
      // 1. Supabase Auth 가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('가입에 실패했습니다.')

      // 2. Users 프로필 테이블 업데이트/삽입
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          name: formData.name,
          phone: formData.phone,
          church_name: formData.church_name,
          denomination: formData.denomination,
          region: formData.region,
          created_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      toast.success('회원가입이 완료되었습니다! 로그인 해주세요. 🙌')
      router.push('/login')
    } catch (error: any) {
      console.error('[Signup Error]', error)
      toast.error(error.message || '가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in bg-slate-50/50">
      <div className="max-w-xl mx-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand font-bold text-sm mb-8 transition-all group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          로그인으로 돌아가기
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-12 shadow-2xl shadow-slate-200/50">
          <div className="mb-10">
            <h1 className="font-modern text-3xl font-extrabold text-slate-900 tracking-tight mb-2">회원가입</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Create Your Account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <p className="text-[11px] font-extrabold text-brand uppercase tracking-widest px-1">기본 정보</p>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="이메일 주소"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="비밀번호 (6자 이상)"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="성함"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="전화번호 (예: 010-1234-5678)"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* 신앙 정보 */}
            <div className="space-y-4 pt-4">
              <p className="text-[11px] font-extrabold text-brand uppercase tracking-widest px-1">신앙 정보</p>
              
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="출석교회명"
                  value={formData.church_name}
                  onChange={e => setFormData({...formData, church_name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="교단 (예: 장로교, 감리교 등)"
                  value={formData.denomination}
                  onChange={e => setFormData({...formData, denomination: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all text-sm appearance-none"
                >
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* 동의 사항 */}
            <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 pt-6 mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={consents.general} 
                  onChange={e => setConsents({...consents, general: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <div className="text-[11px] leading-relaxed">
                   <span className="text-slate-700 font-bold">개인정보 수집 및 이용 동의 (필수)</span>
                   <button type="button" onClick={() => setModal({ isOpen: true, title: '개인정보 수집 및 이용 동의', content: TERMS_TEXTS.privacy })} className="ml-2 text-slate-400 underline decoration-slate-200">보기</button>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={consents.sensitive} 
                  onChange={e => setConsents({...consents, sensitive: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <div className="text-[11px] leading-relaxed">
                   <span className="text-slate-700 font-bold">민감정보(종교) 수집 및 이용 동의 (필수)</span>
                   <button type="button" onClick={() => setModal({ isOpen: true, title: '민감정보 수집 및 이용 동의', content: TERMS_TEXTS.sensitive })} className="ml-2 text-slate-400 underline decoration-slate-200">보기</button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-black hover:shadow-2xl transition-all shadow-lg active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '회원가입 완료하기'}
            </button>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                가입 후 이메일 인증이 필요할 수 있습니다. 입력하신 메일함을 확인해 주세요.
              </p>
            </div>
          </form>
        </div>
      </div>

      <PrivacyPolicyModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        content={modal.content}
      />
    </div>
  )
}
