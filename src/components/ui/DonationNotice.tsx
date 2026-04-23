'use client'

import { useState } from 'react'
import { Heart, Copy, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { PrivacyPolicyModal, TERMS_TEXTS } from '@/components/ui/PrivacyPolicy'

export default function DonationNotice() {
  const accountInfo = "국민은행 272701-04-393285 인터커스텀"
  const accountNumber = "27270104393285"
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: '', content: '' })

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber)
    toast.success('계좌번호가 복사되었습니다. 🙏')
  }

  return (
    <footer className="mt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-white/40 backdrop-blur-sm border border-black/5 rounded-[2.5rem] transition-all hover:bg-white/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/10" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">운영 후원하기</p>
            <p className="text-sm font-bold text-slate-800 font-modern">소중한 후원은 공동체 성장을 위해 쓰입니다.</p>
          </div>
        </div>
        
        <button 
          onClick={handleCopy}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group active:scale-95"
        >
          <span className="text-xs font-bold text-slate-600">{accountInfo}</span>
          <Copy className="w-4 h-4 text-slate-300 group-hover:text-brand transition-colors" />
        </button>
      </div>
      <div className="text-center mt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setModal({ isOpen: true, title: '개인정보처리방침', content: TERMS_TEXTS.privacy })}
            className="text-[10px] text-slate-400 font-extrabold hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            개인정보처리방침
          </button>
          <button 
            onClick={() => setModal({ isOpen: true, title: '이용약관', content: TERMS_TEXTS.tos })}
            className="text-[10px] text-slate-400 font-extrabold hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            이용약관
          </button>
        </div>
        <p className="text-[10px] text-slate-300 font-medium tracking-widest uppercase">
          © 2026 Christian Diary. All rights reserved.
        </p>
      </div>

      <PrivacyPolicyModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        content={modal.content}
      />
    </footer>
  )
}
