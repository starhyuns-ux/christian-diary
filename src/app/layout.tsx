import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
})

export const viewport: Viewport = {
  themeColor: '#f8faff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: '크리스천다이어리 — 신앙 공동체 커뮤니티 캘린더',
  description: '전국 기독교 강의, 소모임, 기도회 일정을 한눈에 확인하고 함께 나누세요. 이단을 제외한 모든 정통 교단이 함께합니다.',
  manifest: '/manifest.json',
  openGraph: {
    title: '크리스천다이어리',
    description: '모든 신앙 일정을 한 곳에서 나누세요.',
    url: 'https://christian-diary.vercel.app',
    siteName: '크리스천다이어리',
    locale: 'ko_KR',
    type: 'website',
  },
}

import InquiryFAB from '@/components/ui/InquiryFAB'
import { LanguageProvider } from '@/lib/contexts/LanguageContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${outfit.variable}`}>
      <body className="bg-pattern min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="fixed inset-0 bg-pattern pointer-events-none opacity-50" />
        <LanguageProvider>
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          <InquiryFAB />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  )
}
