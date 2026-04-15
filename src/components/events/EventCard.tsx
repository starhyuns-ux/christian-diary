import Link from 'next/link'
import { Event, CATEGORY_CONFIG, LOCATION_TYPE_CONFIG } from '@/types'
import { MapPin, Users, Calendar, Repeat, Wallet, Info } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import CategoryBadge from '@/components/ui/CategoryBadge'

interface Props {
  event: Event
}

export default function EventCard({ event }: Props) {
  const config = CATEGORY_CONFIG[event.category]
  const locConfig = LOCATION_TYPE_CONFIG[event.location_type]
  const startDate = parseISO(event.start_at)
  const isFull = event.max_participants != null && event.participant_count != null
    && event.participant_count >= event.max_participants

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="glass rounded-2xl border border-black/5 p-0 hover:border-brand/20 hover:bg-white transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:glow-brand h-full flex flex-col overflow-hidden">
        {/* Thumbnail Image */}
        {event.image_url && (
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-black/5">
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          {/* Category + Location */}
          <div className="flex items-center justify-between mb-3.5">
            <CategoryBadge category={event.category} />
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <span>{locConfig.icon}</span>
              {locConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-slate-900 font-bold text-base leading-snug mb-2 line-clamp-2 flex-1 group-hover:text-brand transition-colors font-modern">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-5">
            {event.description}
          </p>

          {/* Meta */}
          <div className="flex flex-col gap-2 mt-auto">
            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>{format(startDate, 'M월 d일 (E) HH:mm', { locale: ko })}</span>
              {event.is_recurring && (
                <Repeat className="w-3 h-3 text-slate-300 ml-0.5" />
              )}
            </div>

            {/* Location */}
            {event.location_name && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{event.location_name}</span>
              </div>
            )}

            {/* Participants */}
            {event.max_participants != null && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {event.participant_count ?? 0} / {event.max_participants}명
                  </span>
                </div>
                <div className="flex-1 mx-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((event.participant_count ?? 0) / event.max_participants) * 100)}%`,
                      background: isFull
                        ? '#ef4444'
                        : '#4f46e5',
                    }}
                  />
                </div>
                {isFull && (
                  <span className="text-[10px] text-red-500 font-extrabold px-1.5 py-0.5 bg-red-50 rounded">마감</span>
                )}
              </div>
            )}
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
            <div className="flex items-center gap-1.5 text-xs">
              <Wallet className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {event.fee === 0 ? (
                <span className="text-emerald-600 font-bold">무료</span>
              ) : (
                <span className="text-slate-900 font-bold">
                  {event.fee.toLocaleString()}원
                </span>
              )}
            </div>
            {/* Church */}
            {event.church_name && (
              <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px]">
                {event.church_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
