import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white border-t border-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 opacity-80">
          <ShieldCheck className="text-brand" size={24} />
          <span className="font-modern font-extrabold text-slate-900">크리스천다이어리</span>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/privacy" className="text-sm font-bold text-slate-500 hover:text-brand transition-colors">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="text-sm font-bold text-slate-500 hover:text-brand transition-colors">
            이용약관
          </Link>
          <Link href="/about" className="text-sm font-bold text-slate-500 hover:text-brand transition-colors">
            서비스 소개
          </Link>
          <a href="mailto:support@christian-diary.com" className="text-sm font-bold text-slate-500 hover:text-brand transition-colors">
            제휴/문의
          </a>
        </nav>

        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5 mb-2">
            모든 성도가 함께하는 건강한 신앙 커뮤니티 <Heart size={12} className="text-brand" fill="currentColor" /> 크리스천다이어리
          </p>
          <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
            &copy; 2026 Christian Diary. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
