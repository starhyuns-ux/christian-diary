'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
  className?: string
  iconClassName?: string
  showText?: boolean
  label?: string
}

export default function ShareButton({
  title,
  text = '',
  url = '',
  className = '',
  iconClassName = 'w-4 h-4',
  showText = false,
  label = '공유하기'
}: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    let shareUrl = url || window.location.href
    if (url && url.startsWith('/')) {
      shareUrl = `${window.location.origin}${url}`
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        return
      } catch (err) {
        // 사용자가 취소한 경우 등은 무시
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    }

    // fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('링크가 복사되었습니다! 친구들에게 공유해보세요.')
    } catch (err) {
      toast.error('링크 복사에 실패했습니다.')
      console.error('Clipboard copy failed:', err)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 transition-colors ${className}`}
      title={label}
      type="button"
    >
      <Share2 className={iconClassName} />
      {showText && <span>{label}</span>}
    </button>
  )
}
