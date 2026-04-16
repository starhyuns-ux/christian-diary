'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signInWithGoogle } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signInWithGoogle()
    // signInWithGoogle은 리다이렉트 처리됨
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

        {/* Error message */}
        {error && (
          <div className="mb-8 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
            로그인에 실패했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* Login buttons */}
        <div className="flex flex-col gap-4">
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Google로 시작하기
          </button>
        </div>

        {/* Notice */}
        <div className="mt-10 space-y-4">
          <p className="text-center text-[10px] text-slate-400 leading-relaxed font-medium">
            로그인 시 크리스천다이어리의{' '}
            <span className="text-slate-600 font-bold">이용약관</span>과{' '}
            <span className="text-slate-600 font-bold">개인정보처리방침</span>에 동의하게 됩니다.
          </p>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-center text-[10px] text-slate-500 font-bold">
              ⚠️ 이단 교단 및 비기독교 단체의 가입은 제한됩니다.
            </p>
          </div>
        </div>
      </div>
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
