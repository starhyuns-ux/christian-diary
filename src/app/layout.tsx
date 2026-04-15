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
  title: '크리스천다이어리 — 신앙 커뮤니티 캘린더',
  description: '크리스천들의 강의, 소모임, 기도회 등 신앙 공동체 일정을 함께 공유하고 참여하세요.',
  keywords: '크리스천, 기독교, 교회, 소모임, 기도회, 강의, 커뮤니티, 캘린더',
  openGraph: {
    title: '크리스천다이어리',
    description: '신앙 공동체 커뮤니티 캘린더',
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
