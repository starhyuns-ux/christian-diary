import React from 'react';
import { ShieldCheck, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-brand transition-colors font-bold text-sm">
            <ArrowLeft size={18} />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand" size={24} />
            <span className="font-modern font-extrabold text-slate-900">크리스천다이어리</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-12 sm:py-16 text-center text-white relative overflow-hidden">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10">이용약관</h1>
            <p className="text-slate-400 font-medium relative z-10">성숙한 기독교 신앙 공동체를 위한 약속</p>
            <p className="text-[11px] text-slate-500 mt-6 font-bold uppercase tracking-widest relative z-10">최종 개정일: 2026년 4월 25일</p>
          </div>

          <div className="p-8 sm:p-12 prose prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">제1조 (목적)</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                본 약관은 크리스천다이어리(이하 "서비스")가 제공하는 모든 서비스의 이용 조건 및 절차, 회원과 서비스 간의 권리, 의무 및 책임 사항 등을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">제2조 (회원의 의무)</h2>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                <li>회원은 기독교 신앙 윤리에 부합하는 건전한 정보를 등록하고 나누어야 합니다.</li>
                <li>타인의 권리를 침해하거나 허위 정보를 등록하여 공동체에 혼란을 주어서는 안 됩니다.</li>
                <li>이단성 포교 활동이나 상업적인 광고 목적으로 서비스를 오용하는 것을 금지합니다.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">제3조 (서비스의 권한)</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                서비스 운영진은 공동체의 안전을 위해 부적절한 게시물을 사전에 승인 거절하거나 사후에 삭제할 수 있는 권한을 가집니다. 특히 이단성 여부가 확인된 단체의 활동은 예고 없이 제한될 수 있습니다.
              </p>
            </section>

            <div className="border-t border-slate-100 pt-10 text-center">
              <p className="text-xs text-slate-400">
                본 약관은 2026년 4월 25일부터 시행됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-slate-400 text-xs font-medium">
        &copy; 2026 Christian Diary. All rights reserved.
      </footer>
    </div>
  );
}
