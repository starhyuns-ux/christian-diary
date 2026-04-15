import type { Metadata } from 'next'
import { Noto_Sans_KR, Cinzel } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cinzel',
})

export const metadata: Metadata = {
  title: '크리스천다이어리 — 신앙 공동체 커뮤니티 캘린더',
  description: '전국 기독교 강의, 소모임, 기도회 일정을 한눈에 확인하고 함께 나누세요. 이단을 제외한 모든 정통 교단이 함께합니다.',
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  openGraph: {
    title: '크리스천다이어리',
    description: '모든 신앙 일정을 한 곳에서 나누세요.',
    url: 'https://christian-diary.vercel.app',
    siteName: '크리스천다이어리',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${cinzel.variable}`}>
      <body className="bg-pattern min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="fixed inset-0 bg-pattern pointer-events-none" />
        <Navbar />
        <main className="relative z-10">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(30, 27, 75, 0.9)',
              color: '#f1f0ff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  )
}
