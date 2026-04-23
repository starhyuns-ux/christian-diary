export type EventCategory =
  | 'lecture'
  | 'small_group'
  | 'prayer'
  | 'worship'
  | 'volunteer'
  | 'missionary_shelter'
  | 'other'

export type LocationType = 'online' | 'offline' | 'hybrid'

export type ParticipantStatus = 'pending' | 'confirmed' | 'cancelled'

/** 관리자 승인 상태 */
export type EventStatus = 'pending' | 'approved' | 'rejected'

/** 후원금 납부 상태 */
export type DonationStatus = 'not_required' | 'pending' | 'submitted' | 'verified'

/** 강의는 수익의 10% 플랫폼 후원비 */
export const PLATFORM_FEE_RATE: Record<EventCategory, number> = {
  lecture: 0.10,
  small_group: 0,
  prayer: 0,
  worship: 0,
  volunteer: 0,
  missionary_shelter: 0,
  other: 0,
}

export interface User {
  id: string
  name: string
  avatar_url: string | null
  church_name: string | null
  phone?: string | null
  region?: string | null
  denomination?: string | null
  is_admin?: boolean
  is_verified?: boolean
  created_at?: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  event_id: string | null
  content: string
  is_read: boolean
  created_at: string
  sender?: User
  receiver?: User
}

export interface Event {
  id: string
  host_id: string
  host?: User
  title: string
  description: string
  category: EventCategory
  /** 관리자 승인 상태: 승인된 이벤트만 공개 노출 */
  status: EventStatus
  start_at: string
  end_at?: string | null
  location_type: LocationType
  location_name: string | null
  location_address: string | null
  location_url: string | null
  max_participants: number | null
  /** 모임비 (원). 0이면 무료 */
  fee: number
  /** 모임비 안내 문구 (현장납부, 계좌이체 등) */
  fee_description: string | null
  /** 플랫폼 수수료율. 강의=0.10, 나머지=0 */
  platform_fee_rate: number
  is_recurring: boolean
  recurrence_rule: string | null
  region: string | null
  /** 교단명. 이단 제외 모든 교단 허용, 관리자가 검토 */
  denomination: string | null
  church_name: string | null
  image_url: string | null
  /** 후원 관리 */
  donation_status: DonationStatus
  donation_proof_url: string | null
  /** 관리자 검토 메모 */
  admin_note: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  participant_count?: number
  original_id?: string // 반복 일정 확장 시 원본 ID 추적용
  is_featured?: boolean // 관리자에 의한 상단 고정 노출 여부
  external_link?: string | null // 홈페이지나 오픈채팅 등 외부 링크
}

export interface Prayer {
  id: string
  user_id: string | null
  user?: User
  guest_name?: string | null
  content: string
  created_at: string
  amen_count: number
  is_amened?: boolean // 현재 사용자가 아멘을 눌렀는지 여부
}

export interface PrayerAmen {
  id: string
  prayer_id: string
  user_id: string
  created_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status: ParticipantStatus
  registered_at: string
}

export const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; bgColor: string; dotColor: string; className: string }
> = {
  lecture: {
    label: '강의',
    color: '#c4b5fd',
    bgColor: 'rgba(167, 139, 250, 0.8)',
    dotColor: '#a78bfa',
    className: 'category-lecture',
  },
  small_group: {
    label: '소모임',
    color: '#6ee7b7',
    bgColor: 'rgba(52, 211, 153, 0.8)',
    dotColor: '#34d399',
    className: 'category-small-group',
  },
  prayer: {
    label: '기도회',
    color: '#93c5fd',
    bgColor: 'rgba(96, 165, 250, 0.8)',
    dotColor: '#60a5fa',
    className: 'category-prayer',
  },
  worship: {
    label: '예배',
    color: '#fde68a',
    bgColor: 'rgba(251, 191, 36, 0.8)',
    dotColor: '#fbbf24',
    className: 'category-worship',
  },
  volunteer: {
    label: '봉사',
    color: '#fed7aa',
    bgColor: 'rgba(251, 146, 60, 0.8)',
    dotColor: '#fb923c',
    className: 'category-volunteer',
  },
  missionary_shelter: {
    label: '선교사 쉼터',
    color: '#a7f3d0',
    bgColor: 'rgba(5, 150, 105, 0.8)',
    dotColor: '#059669',
    className: 'category-shelter',
  },
  other: {
    label: '기타',
    color: '#cbd5e1',
    bgColor: 'rgba(148, 163, 184, 0.8)',
    dotColor: '#94a3b8',
    className: 'category-other',
  },
}

export const LOCATION_TYPE_CONFIG: Record<LocationType, { label: string; icon: string }> = {
  online: { label: '온라인', icon: '💻' },
  offline: { label: '오프라인', icon: '📍' },
  hybrid: { label: '온/오프라인', icon: '🌐' },
}

export const REGIONS = [
  '전국',
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '광주',
  '대전',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]
