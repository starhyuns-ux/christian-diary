'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function InquiryFAB() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()

    // 문의 내용을 inquiries 테이블에 저장 (테이블이 없어도 로직은 구성)
    const { error } = await supabase
      .from('inquiries')
      .insert({
        user_id: user?.id || null,
        content: message,
        type: 'registration',
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Inquiry error:', error)
      toast.error('문의 전송에 실패했습니다. 다시 시도해주세요.')
    } else {
      toast.success('문의가 전송되었습니다! 곧 답변 드릴게요. 🙏')
      setMessage('')
      setIsOpen(false)
    }
    setSending(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {/* Inquiry Window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden animate-slide-up flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-modern font-bold text-base">{t('inquiry_title')}</p>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Admin Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat area (Simulated) */}
          <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-4 min-h-[200px]">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-brand-600" />
              </div>
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-black/5">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {t('inquiry_intro')}
                </p>
              </div>
            </div>
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-black/5 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('inquiry_placeholder')}
              className="flex-1 bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand/20 transition-all border border-black/5"
            />
            <button
              disabled={sending || !message.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white disabled:opacity-50 hover:bg-brand-700 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 group ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-brand-600 hover:bg-brand-500 hover:-translate-y-1'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-brand-600 rounded-full animate-pulse" />
          </div>
        )}
      </button>
    </div>
  )
}
