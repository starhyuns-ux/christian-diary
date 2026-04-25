import React from 'react';
import { ShieldCheck, ArrowLeft, Mail, Phone, ExternalLink, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <div className="bg-brand px-8 py-12 sm:py-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-white rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-white rounded-full blur-[100px]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10">개인정보 처리방침</h1>
            <p className="text-brand-100 font-medium relative z-10">신앙 공동체의 소중한 정보를 안전하게 보호합니다</p>
            <p className="text-[11px] text-brand-200 mt-6 font-bold uppercase tracking-widest relative z-10">최종 개정일: 2026년 4월 25일</p>
          </div>

          <div className="p-8 sm:p-12 prose prose-slate max-w-none">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 italic text-slate-600 text-sm leading-relaxed">
              크리스천다이어리(이하 "서비스")는 기독교 신앙 공동체의 건강한 소통을 지원하며, 정보주체의 개인정보를 무엇보다 소중하게 생각합니다. 본 방침은 관련 법령을 준수하며, 투명한 정보 처리를 약속합니다.
            </div>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제1조 개인정보의 처리 목적
              </h2>
              <p className="text-slate-600 leading-relaxed">
                서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                <li><strong>행사 및 일정 관리:</strong> 기독교 관련 행사 등록, 수정, 승인 절차 수행 및 관리</li>
                <li><strong>사용자 본인확인:</strong> 서비스 이용에 따른 본인확인, 가입 의사 확인, 부정이용 방지</li>
                <li><strong>건전한 커뮤니티 유지:</strong> 이단성 검증을 위한 소속 교회/교단 정보 확인 및 관리</li>
                <li><strong>문의 및 고충 처리:</strong> 사용자 문의 사항에 대한 답변 및 해결 지원</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제2조 처리하는 개인정보의 항목
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 border border-slate-200 font-bold">구분</th>
                      <th className="p-4 border border-slate-200 font-bold">수집 항목</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border border-slate-200 font-medium bg-slate-50/50">회원가입 및 문의</td>
                      <td className="p-4 border border-slate-200 text-slate-600">성명(또는 닉네임), 이메일 주소, 휴대전화번호, 소속 교회/교단</td>
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200 font-medium bg-slate-50/50">행사 등록</td>
                      <td className="p-4 border border-slate-200 text-slate-600">행사 담당자 연락처, 행사 장소 정보</td>
                    </tr>
                    <tr>
                      <td className="p-4 border border-slate-200 font-medium bg-slate-50/50">자동 수집</td>
                      <td className="p-4 border border-slate-200 text-slate-600">IP 주소, 쿠키, 서비스 방문 및 이용 기록</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제3조 개인정보의 처리 및 보유 기간
              </h2>
              <p className="text-slate-600 leading-relaxed">
                서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 동의받은 기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                <li><strong>보유 기간:</strong> 회원 탈퇴 시까지 또는 파기 요청 시까지</li>
                <li><strong>장기 미이용자:</strong> 1년 이상 서비스를 이용하지 않은 경우, 개인정보를 파기하거나 별도 분리하여 보관합니다.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제4조 제3자 제공 및 위탁
              </h2>
              <p className="text-slate-600 leading-relaxed">
                서비스는 원칙적으로 사용자의 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 의하거나 사용자가 직접 동의한 경우에 한하여 최소한의 정보를 제공할 수 있습니다. 현재 서비스 운영을 위해 다음의 외부 솔루션을 이용하고 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-600">
                <li><strong>데이터베이스 관리:</strong> Supabase (데이터 보안 보관)</li>
                <li><strong>인프라 및 배포:</strong> Vercel (서비스 호스팅)</li>
                <li><strong>분석 도구:</strong> Google Analytics (서비스 이용 통계)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제5조 개인정보의 안전성 확보 조치
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">기술적 보호</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">중요 데이터 암호화 보관, 보안 솔루션 적용 및 주기적인 업데이트를 수행합니다.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">관리적 보호</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">내부 관리 지침 수립, 최소한의 인원에게만 접근 권한 부여 및 보안 교육을 진행합니다.</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                제6조 개인정보 보호책임자 및 문의
              </h2>
              <div className="bg-slate-900 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
                    <Mail className="text-brand-300" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">이메일 문의</p>
                    <p className="text-lg font-bold">support@christian-diary.com</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  개인정보와 관련한 불편사항이나 문의사항은 위 메일로 연락주시면 지체 없이 처리해 드리겠습니다.
                </p>
              </div>
            </section>

            <div className="border-t border-slate-100 pt-10 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                모든 성도가 함께하는 건강한 신앙 커뮤니티 <Heart size={12} className="text-brand" fill="currentColor" /> 크리스천다이어리
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
