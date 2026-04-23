'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  Heart, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function GuidePage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: '환영합니다! 👋',
      description: '크리스천 다이어리는 성도님들의 소중한 만남과 기도를 잇는 아름다운 동행의 공간입니다.',
      icon: <BookOpen className="w-8 h-8 text-brand" />,
      items: [
        '지역별, 카테고리별 다양한 모임을 확인하세요.',
        '매일 업데이트되는 말씀으로 하루를 시작하세요.',
        '함께 지어져 가는 아름다운 공동체를 경험하세요.'
      ]
    },
    {
      title: '모임 찾기 & 참여 🔍',
      description: '나에게 꼭 필요한 영적 성장의 기회를 찾아보세요.',
      icon: <Search className="w-8 h-8 text-brand" />,
      items: [
        '달력 뷰를 통해 이번 주 일정을 한눈에 확인하세요.',
        '로그인 없이도 익명으로 간편하게 참가 신청이 가능합니다.',
        '궁금한 점은 주최자에게 직접 문의 메시지를 보낼 수 있습니다.'
      ]
    },
    {
      title: '모임 주최하기 ➕',
      description: '은사대로 소모임이나 강의, 기도회를 직접 열어보세요.',
      icon: <PlusCircle className="w-8 h-8 text-brand" />,
      items: [
        '상단 메뉴의 "모임 만들기" 버튼을 클릭하세요.',
        '장소, 시간, 교단 정보 등을 입력하고 승인을 요청하세요.',
        '승인 후 생성된 전용 QR 코드로 모임을 널리 홍보하세요.'
      ]
    },
    {
      title: '함께 기도하기 🙏',
      description: '기도TALK에서 성도님들의 마음을 나누고 중보하세요.',
      icon: <MessageSquare className="w-8 h-8 text-brand" />,
      items: [
        '말씀 안에서 자신의 기도제목을 자유롭게 나눠보세요.',
        '다른 성도님의 기도에 "아멘"으로 함께 화답하세요.',
        '익명으로도 기도를 부탁하거나 중보할 수 있습니다.'
      ]
    }
  ]

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0))

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/5 border border-brand/10 mb-4">
          <CheckCircle2 className="w-4 h-4 text-brand" />
          <span className="text-[10px] font-extrabold text-brand uppercase tracking-widest">User Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 font-modern">다이어리 사용 가이드</h1>
        <p className="text-slate-500 font-bold text-sm">더 깊은 교제와 나눔을 위한 튜토리얼</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden lg:block space-y-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeStep === idx 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-105' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === idx ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                {idx + 1}
              </span>
              {step.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -z-10" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-brand/5 flex items-center justify-center mb-8 border border-brand/5 shadow-inner">
                {steps[activeStep].icon}
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-modern">
                {steps[activeStep].title}
              </h2>
              
              <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm sm:text-base break-keep">
                {steps[activeStep].description}
              </p>

              <ul className="w-full space-y-4 mb-12">
                {steps[activeStep].items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-brand/30 transition-colors">
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-brand" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between w-full pt-8 border-t border-slate-50">
                <button 
                  onClick={prevStep}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  이전
                </button>
                
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStep === idx ? 'w-6 bg-brand' : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {activeStep === steps.length - 1 ? (
                  <Link 
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-white font-extrabold text-sm shadow-lg hover:bg-brand-600 transition-all animate-bounce"
                  >
                    시작하기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button 
                    onClick={nextStep}
                    className="flex items-center gap-2 text-brand font-bold text-sm hover:translate-x-1 transition-all"
                  >
                    다음
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-brand/5 rounded-3xl p-6 border border-brand/5 text-center">
            <p className="text-slate-500 font-bold text-xs italic">
              "두세 사람이 내 이름으로 모인 곳에는 나도 그들 중에 있느니라" (마태복음 18:20)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
