'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Calendar, Search, Plus, User, LogOut, LogIn, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User as AppUser } from '@/types'

const navLinks = [
  { href: '/', label: '캘린더', icon: Calendar },
  { href: '/events', label: '이벤트', icon: Calendar },
  { href: '/search', label: '검색', icon: Search },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    // 세션 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as AppUser)
  }

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  const avatarUrl = authUser?.user_metadata?.avatar_url
  const displayName = profile?.name || authUser?.user_metadata?.full_name || '사용자'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg glow-brand group-hover:scale-110 transition-transform duration-200">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M2 12h20" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-modern text-lg font-bold text-slate-900 hidden sm:block">
                크리스천다이어리
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-brand text-white shadow-md'
                        : 'text-slate-600 hover:text-brand hover:bg-brand/5'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
              {profile?.is_admin && (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      pathname.startsWith('/admin')
                        ? 'bg-amber-100 text-amber-700 shadow-sm'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  관리자
                </Link>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {authUser ? (
                <>
                  <Link
                    href="/events/create"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 transition-all duration-200 shadow-lg glow-brand"
                  >
                    <Plus className="w-4 h-4" />
                    이벤트 등록
                  </Link>

                  {/* User avatar dropdown */}
                  <div className="relative">
                    <button
                      id="user-avatar-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-brand-500/50 transition-colors duration-200"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-11 w-52 glass-strong rounded-xl border border-white/10 py-2 shadow-2xl animate-slide-up">
                        <div className="px-4 py-2 border-b border-black/5 mb-1">
                          <p className="text-slate-900 text-sm font-bold truncate">{displayName}</p>
                          <p className="text-slate-500 text-xs truncate">{authUser.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-brand hover:bg-brand/5 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          내 프로필
                        </Link>
                        {profile?.is_admin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            관리자 대시보드
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  id="login-btn"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-black/5 text-slate-700 text-sm font-bold hover:text-brand hover:border-brand/40 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </Link>
              )}

              <button
                className="md:hidden w-9 h-9 rounded-lg bg-white border border-black/5 flex items-center justify-center shadow-sm"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden glass-strong border-t border-white/10 px-4 py-4 animate-slide-up">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      active ? 'bg-brand text-white shadow-lg' : 'text-slate-600 hover:text-brand hover:bg-brand/5'
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                )
              })}

              {authUser ? (
                <>
                  <Link
                    href="/events/create"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mt-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Plus className="w-4 h-4" />
                    이벤트 등록
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-brand hover:bg-brand/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    내 프로필
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-brand border border-brand/20 bg-brand/5"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  로그인
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
      <div className="h-16" />

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </>
  )
}
