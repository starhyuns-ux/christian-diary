'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchPrayers, createPrayer, toggleAmen, deletePrayer, updatePrayer } from '@/lib/prayers'
import { Prayer } from '@/types'
import { MessageSquare, Heart, Send, Loader2, User, Church, Trash2, Edit3, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function PrayerTalkPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [user, setUser] = useState<any>(null)
  
  // 수정 기능 관련 상태
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [localAmens, setLocalAmens] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      loadPrayers(user?.id)
    })

    // 로컬 스토리지에서 비회원 아멘 기록 불러오기
    try {
      const savedAmens = localStorage.getItem('guest_amens')
      if (savedAmens) setLocalAmens(JSON.parse(savedAmens))
    } catch (e) {
      console.error('Failed to load guest_amens', e)
    }
  }, [])

  const loadPrayers = async (userId?: string) => {
    setLoading(true)
    const data = await fetchPrayers(userId)
    setPrayers(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return toast.error('기도 내용을 입력해주세요')

    setSubmitting(true)
    
    // 이름이 없으면 익명-번호 생성
    let finalName = guestName.trim()
    if (!finalName && !user) {
      finalName = `익명-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const success = await createPrayer(content, user?.id || null, finalName || null)
    if (success) {
      setContent('')
      setGuestName('')
      toast.success('기도 제목이 등록되었습니다 🙏')
      loadPrayers(user?.id)
    } else {
      toast.error('등록에 실패했습니다')
    }
    setSubmitting(false)
  }

  const handleAmen = async (prayer: Prayer) => {
    // 이미 로컬에서 아멘을 한 비회원인 경우 (비회원 취소는 일단 미지원/단순화)
    if (!user && localAmens.includes(prayer.id)) {
      return toast.error('이미 아멘 하셨습니다 🙏')
    }

    const isAdding = !prayer.is_amened
    
    // Optimistic UI update
    setPrayers(prev => prev.map(p => 
      p.id === prayer.id 
        ? { ...p, is_amened: isAdding, amen_count: p.amen_count + (isAdding ? 1 : -1) }
        : p
    ))

    const success = await toggleAmen(prayer.id, user?.id || null, !!prayer.is_amened)
    if (success) {
      if (!user && isAdding) {
        const newLocalAmens = [...localAmens, prayer.id]
        setLocalAmens(newLocalAmens)
        localStorage.setItem('guest_amens', JSON.stringify(newLocalAmens))
      }
    } else {
      // Revert if failed
      loadPrayers(user?.id)
      toast.error('처리에 실패했습니다')
    }
  }

  const handleDelete = async (prayerId: string) => {
    if (!confirm('기도 제목을 삭제하시겠습니까?')) return

    const success = await deletePrayer(prayerId, user.id)
    if (success) {
      toast.success('삭제되었습니다')
      setPrayers(prev => prev.filter(p => p.id !== prayerId))
    } else {
      toast.error('삭제에 실패했습니다')
    }
  }

  const startEdit = (prayer: Prayer) => {
    setEditingId(prayer.id)
    setEditContent(prayer.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleUpdate = async (prayerId: string) => {
    if (!editContent.trim()) return toast.error('내용을 입력해주세요')

    const success = await updatePrayer(prayerId, editContent, user.id)
    if (success) {
      toast.success('수정되었습니다')
      setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, content: editContent } : p))
      setEditingId(null)
    } else {
      toast.error('수정에 실패했습니다')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-5 font-modern tracking-tight">기도TALK</h1>
        
        {/* Scripture Quote */}
        <div className="max-w-xl mx-auto mb-8 p-6 sm:p-7 glass rounded-[2.2rem] border border-brand/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-30" />
          <p className="text-slate-600 font-medium leading-relaxed mb-3 text-sm sm:text-base break-keep italic">
            “너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라”
          </p>
          <p className="text-brand font-extrabold text-xs tracking-widest uppercase">에베소서 2:22</p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors" />
        </div>

        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Prayer Community</p>
        <div className="mt-4 flex justify-center">
          <div className="h-1.5 w-12 bg-brand rounded-full shadow-sm" />
        </div>
      </div>

      {/* Prayer Form */}
      <div className="mb-10 bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -z-10" />
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="max-w-xs">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 px-1">작성자 이름 (선택)</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="미입력시 익명 부여"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-black/5 text-slate-900 text-sm font-bold focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm"
              />
            </div>
          )}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="함께 나누고 싶은 기도 제목을 적어주세요..."
              disabled={submitting}
              rows={4}
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-black/5 text-slate-900 placeholder-slate-400 text-base font-medium focus:outline-none focus:border-brand/30 focus:bg-white transition-all shadow-sm resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="absolute bottom-4 right-4 p-3 rounded-xl bg-brand text-white shadow-lg hover:bg-brand-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* Prayer List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
            <p className="text-slate-400 font-bold animate-pulse">기도 제목을 불러오는 중...</p>
          </div>
        ) : prayers.length > 0 ? (
          prayers.map((prayer) => (
            <div key={prayer.id} className="bg-white rounded-2xl p-5 sm:p-7 border border-black/5 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                    {prayer.user?.avatar_url ? (
                      <img src={prayer.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-base">{prayer.user?.name || prayer.guest_name || '익명의 성도'}</p>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Church className="w-3 h-3" />
                      <span>{prayer.user?.church_name || '믿음의 공동체'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true, locale: ko })}</span>
                    </div>
                  </div>
                </div>
                
                {/* 본인 글인 경우 수정/삭제 버튼 노출 */}
                {user?.id === prayer.user_id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(prayer)}
                      className="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/5 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(prayer.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-8">
                {editingId === prayer.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-brand/20 text-slate-900 text-base font-medium focus:outline-none focus:bg-white transition-all shadow-inner resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all">취소</button>
                      <button onClick={() => handleUpdate(prayer.id)} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand text-white text-sm font-bold shadow-lg hover:bg-brand-600 transition-all">
                        <Check className="w-4 h-4" /> 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap italic">
                    " {prayer.content} "
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <button
                  onClick={() => handleAmen(prayer)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-extrabold transition-all duration-300 shadow-sm ${
                    prayer.is_amened || (!user && localAmens.includes(prayer.id))
                      ? 'bg-rose-500 text-white shadow-rose-200 shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 border border-transparent'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${prayer.is_amened || (!user && localAmens.includes(prayer.id)) ? 'fill-current' : ''}`} />
                  <span>아멘 {prayer.amen_count > 0 && prayer.amen_count}</span>
                </button>
                
                <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">
                  Together in Prayer
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">아직 등록된 기도 제목이 없습니다.<br/>가장 먼저 기도를 부탁해보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
