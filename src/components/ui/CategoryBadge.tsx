import { EventCategory, CATEGORY_CONFIG } from '@/types'

interface Props {
  category: EventCategory
  size?: 'sm' | 'md'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${
        size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.dotColor }} />
      {config.label}
    </span>
  )
}
