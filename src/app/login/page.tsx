'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { signInWithGoogle } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { PrivacyPolicyModal, TERMS_TEXTS } from '@/components/ui/PrivacyPolicy'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const [consents, setConsents] = useState({ general: false, sensitive: false })
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' })
  const [isInApp, setIsInApp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera
    const isInsideApp = /KAKAOTALK|Instagram|FBAV|FBAN|Line/i.test(ua)
    setIsInApp(isInsideApp)
  }, [])

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signInWithGoogle()
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      toast.error('로그인 정보가 일치하지 않습니다.')
      setLoading(false)
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 w-full max-w-md shadow-2xl animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-brand flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-modern text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            크리스천다이어리
          </h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Community Calendar</p>
        </div>

        {/* In-App Browser Warning */}
        {isInApp && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 animate-pulse">
            <div className="flex gap-3 mb-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <p className="text-sm font-extrabold leading-tight">보안 브라우저 사용 안내</p>
            </div>
            <p className="text-[11px] font-bold leading-relaxed mb-4 opacity-80">
              구글 보안 정책상 카카오톡/인스타 브라우저에서는 로그인이 불가능합니다. **사파리나 크롬** 앱으로 접속해 주세요.
            </p>
            <div className="bg-white/50 p-3 rounded-xl border border-amber-100 space-y-2">
               <p className="text-[10px] font-extrabold text-amber-700">📌 외부 브라우저 여는 법:</p>
               <p className="text-[10px] font-bold flex items-center gap-2">
                 <span className="bg-amber-200 px-1.5 py-0.5 rounded">iPhone</span> 우측 하단 <ExternalLink className="w-3 h-3 inline" /> 아이콘 클릭
               </p>
               <p className="text-[10px] font-bold flex items-center gap-2">
                 <span className="bg-amber-200 px-1.5 py-0.5 rounded">Android</span> 우측 상단 ┇ 메뉴 → 외부 브라우저
               </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-8 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
            로그인에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* Login buttons */}
        <div className="flex flex-col gap-5">
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
             <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={consents.general} 
                  onChange={e => setConsents({...consents, general: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <div className="text-[11px] leading-relaxed">
                   <span className="text-slate-700 font-bold">개인정보 수집 및 이용 동의 (필수)</span>
                   <button onClick={() => setModal({ isOpen: true, title: '개인정보 수집 및 이용 동의', content: TERMS_TEXTS.privacy })} className="ml-2 text-slate-400 underline decoration-slate-200">보기</button>
                </div>
             </label>
             <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={consents.sensitive} 
                  onChange={e => setConsents({...consents, sensitive: e.target.checked})}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <div className="text-[11px] leading-relaxed">
                   <span className="text-slate-700 font-bold">민감정보(종교) 수집 및 이용 동의 (필수)</span>
                   <button onClick={() => setModal({ isOpen: true, title: '민감정보 수집 및 이용 동의', content: TERMS_TEXTS.sensitive })} className="ml-2 text-slate-400 underline decoration-slate-200">보기</button>
                </div>
             </label>
          </div>

          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading || !consents.general || !consents.sensitive}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-50 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 계속하기
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-300 font-bold">또는 이메일로 로그인</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-brand/30 transition-all"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:outline-none focus:border-brand/30 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !email || !password || !consents.general || !consents.sensitive}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-extrabold text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '이메일로 로그인'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 font-medium">
              아직 회원이 아니신가요?{' '}
              <Link href="/signup" className="text-brand font-bold hover:underline">회원가입하기</Link>
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-10 space-y-4">
          <p className="text-center text-[10px] text-slate-400 leading-relaxed font-medium">
            로그인 시 크리스천다이어리의{' '}
            <button onClick={() => setModal({ isOpen: true, title: '이용약관', content: TERMS_TEXTS.tos })} className="text-slate-600 font-bold hover:underline">이용약관</button>에 동의하게 됩니다.
          </p>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-center text-[10px] text-slate-500 font-bold">
              ⚠️ 이단 교단 및 비기독교 단체의 가입은 제한됩니다.
            </p>
          </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center text-slate-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-sm font-medium">로그인 서비스 준비 중...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
