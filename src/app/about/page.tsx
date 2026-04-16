'use client'

import { Heart, Calendar, Users, Target, BookOpen } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-brand/10 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-current" />
            Faith Meets Technology
          </div>
          <h1 className="font-modern text-5xl sm:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
            믿음의 기록,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">
              그 이상의 가치
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            크리스천다이어리는 하나님과 동행하는 매일의 삶을 기록하고,<br />
            믿음의 공동체가 함께 성장할 수 있는 디지털 쉼터를 지향합니다.
          </p>
        </section>

        {/* Mission Section */}
        <section className="glass rounded-[2.5rem] p-10 sm:p-16 relative overflow-hidden shadow-2xl border-white/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand/5 rounded-full blur-3xl" />
          <div className="relative space-y-8">
            <div className="inline-block p-4 bg-brand-50 rounded-2xl text-brand-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="font-modern text-3xl font-bold text-slate-900">우리의 비전</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
                  기록하는 신앙
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  매일의 큐티, 기도 응답, 감사 제목을 기록하며 하나님께서 부어주신 은혜를 잊지 않고 간직할 수 있도록 돕습니다.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-400 rounded-full" />
                  연합하는 공동체
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  분산된 교회 내의 각종 모임과 예배 일정을 단일 채널로 통합하여, 공동체의 소통을 원활하게 잇습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:shadow-xl group">
            <Calendar className="w-10 h-10 text-brand-500 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-slate-900 mb-3">스마트 캘린더</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              예배, 소그룹, 봉사 일정을 직관적으로 관리하고 확인할 수 있습니다.
            </p>
          </div>
          <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:shadow-xl group">
            <Users className="w-10 h-10 text-brand-500 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-slate-900 mb-3">공동체 네트워크</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              교회와 모임의 소식을 공유하고 함께 기도하며 믿음의 성숙을 이뤄갑니다.
            </p>
          </div>
          <div className="p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-100 hover:border-brand-200 transition-all duration-300 hover:shadow-xl group">
            <Target className="w-10 h-10 text-brand-500 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold text-slate-900 mb-3">영적 루틴 형성</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              나만의 신앙 루틴을 설정하고 성실하게 기록하며 믿음의 길을 걸어갑니다.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-20 bg-brand-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="absolute bottom-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="relative space-y-8 px-6">
            <h2 className="font-modern text-3xl sm:text-4xl font-bold">지금, 당신의 신앙 여정을 기록해보세요.</h2>
            <p className="text-brand-100 text-lg">하나님께서 주신 모든 순간이 은혜의 조각이 됩니다.</p>
            <a 
              href="/" 
              className="inline-block px-10 py-4 bg-white text-brand-600 rounded-full font-bold hover:bg-brand-50 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              시작하기
            </a>
          </div>
        </section>

        <footer className="text-center pb-12 text-slate-400 text-sm italic">
          &ldquo;내가 네 갈 길을 가르쳐 보이고 너를 주목하여 훈계하리로다&rdquo; (시편 32:8)
        </footer>
      </div>
    </main>
  )
}
