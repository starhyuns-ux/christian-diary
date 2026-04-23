import { supabase } from '@/lib/supabase'
import { Event, EventCategory } from '@/types'
import { format, parseISO, addHours } from 'date-fns'

interface FetchEventsOptions {
  category?: EventCategory[]
  region?: string
  limit?: number
}

/**
 * 승인된 이벤트 목록을 Supabase에서 가져옵니다.
 * events_with_count 뷰를 사용해 participant_count를 포함합니다.
 */
export async function fetchApprovedEvents(options: FetchEventsOptions = {}): Promise<Event[]> {
  let query = supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name, is_verified)
    `)
    .eq('status', 'approved')
    .order('is_featured', { ascending: false }) // 상단 고정 우선
    .order('start_at', { ascending: true })

  if (options.category && options.category.length > 0) {
    query = query.in('category', options.category)
  }

  if (options.region && options.region !== '전국') {
    query = query.or(`region.eq.${options.region},region.eq.전국`)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('[fetchApprovedEvents] error:', error)
    return []
  }

  return (data ?? []) as Event[]
}

/**
 * 이벤트 단건 조회
 */
export async function fetchEventById(id: string): Promise<Event | null> {
  // 뷰 대신 테이블에서 직접 가져와서 컬럼 누락 문제 방지
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name, phone, is_verified)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[fetchEventById] error:', error)
    return null
  }

  return data as Event
}

/**
 * 이벤트 등록 (pending 상태로 제출)
 */
export async function createEvent(
  payload: Omit<Event, 'id' | 'status' | 'platform_fee_rate' | 'admin_note' | 'reviewed_at' | 'created_at' | 'updated_at' | 'participant_count' | 'host'>
): Promise<{ id: string } | null> {
  // 카테고리에 따른 수수료율 설정
  const platform_fee_rate = payload.category === 'lecture' ? 0.10 : 0

  const { data, error } = await supabase
    .from('events')
    .insert({ 
      ...payload, 
      status: 'pending',
      platform_fee_rate 
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createEvent] error:', error)
    return null
  }

  return data
}

/**
 * 이벤트 참가 신청 (로그인 유저 또는 익명 유저)
 */
export async function joinEvent(eventId: string, userId: string | null, guestInfo?: { name: string, phone: string }): Promise<boolean> {
  const { error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      user_id: userId,
      guest_name: guestInfo?.name || null,
      guest_phone: guestInfo?.phone || null,
      status: 'confirmed'
    })

  if (error) {
    console.error('[joinEvent] error:', error)
    return false
  }
  return true
}

/**
 * 이벤트 참가 취소
 */
export async function leaveEvent(eventId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('event_participants')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) {
    console.error('[leaveEvent] error:', error)
    return false
  }
  return true
}

/**
 * 이벤트 수정
 */
export async function updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('[updateEvent] error:', error)
    return false
  }
  return true
}

/**
 * 이벤트 참가자 목록 조회 (호스트용)
 */
export async function fetchEventParticipants(eventId: string) {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      *,
      user:users(id, name, avatar_url, church_name, phone)
    `)
    .eq('event_id', eventId)
    .order('registered_at', { ascending: false })

  if (error) {
    console.error('[fetchEventParticipants] error:', error)
    return []
  }
  return data
}

/**
 * 이벤트 삭제
 */
export async function deleteEvent(eventId: string): Promise<boolean> {
  // 1. 참가자 데이터 먼저 삭제
  await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)

  // 2. 이벤트 삭제
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('[deleteEvent] error:', error)
    return false
  }
  return true
}

/**
 * 관리자: 여러 이벤트를 한꺼번에 삭제
 * 제약 조건을 피하기 위해 관련 참가자 데이터를 먼저 삭제합니다.
 */
export async function bulkDeleteEvents(ids: string[]): Promise<boolean> {
  // 1. 관련 참가자 데이터 먼저 삭제
  await supabase
    .from('event_participants')
    .delete()
    .in('event_id', ids)

  // 2. 이벤트 삭제
  const { error, count } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .in('id', ids)

  if (error) {
    console.error('[bulkDeleteEvents] error:', error)
    return false
  }

  // 삭제된 행이 하나도 없다면 실패로 간주 (권한 부족 등)
  if (count === 0) {
    console.warn('[bulkDeleteEvents] No rows deleted. Check RLS policies or IDs.')
    return false
  }

  return true
}

/**
 * 관리자: 이벤트 승인
 */
export async function approveEvent(eventId: string, adminNote?: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({
      status: 'approved',
      admin_note: adminNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', eventId)

  if (error) {
    console.error('[approveEvent] error:', error)
    return false
  }
  return true
}

/**
 * 관리자: 이벤트 거절
 */
export async function rejectEvent(eventId: string, adminNote: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({
      status: 'rejected',
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', eventId)

  if (error) {
    console.error('[rejectEvent] error:', error)
    return false
  }
  return true
}

/**
 * 관리자: 대기 중인 이벤트 목록
 */
export async function fetchPendingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[fetchPendingEvents] error:', error)
    return []
  }

  return (data ?? []) as Event[]
}

/**
 * 내가 신청한 이벤트 목록
 */
export async function fetchMyJoinedEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      event:events_with_count(
        *,
        host:users(id, name, avatar_url, church_name)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('registered_at', { ascending: false })

  if (error) {
    console.error('[fetchMyJoinedEvents] error:', error)
    return []
  }

  // Supabase join query result mapping
  return (data?.map((d: any) => d.event) ?? []) as unknown as Event[]
}

/**
 * 내가 주최한 이벤트 목록 (상태 상관없이)
 */
export async function fetchMyHostedEvents(userId: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name)
    `)
    .eq('host_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchMyHostedEvents] error:', error)
    return []
  }

  return (data ?? []) as Event[]
}

/**
 * 후원금 확인증 제출
 */
export async function submitDonationProof(eventId: string, proofUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({
      donation_status: 'submitted',
      donation_proof_url: proofUrl,
    })
    .eq('id', eventId)

  if (error) {
    console.error('[submitDonationProof] error:', error)
    return false
  }
  return true
}

/**
 * 관리자: 후원금 확인 완료
 */
export async function verifyDonation(eventId: string): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({
      donation_status: 'verified',
    })
    .eq('id', eventId)

  if (error) {
    console.error('[verifyDonation] error:', error)
    return false
  }
  return true
}

/**
 * 관리자: 후원이 필요한(확인증 제출된) 모든 이벤트 목록
 */
export async function fetchDonationPendingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name)
    `)
    .eq('donation_status', 'submitted')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[fetchDonationPendingEvents] error:', error)
    return []
  }

  return (data ?? []) as Event[]
}

/**
 * 관리자: 모든 상태의 이벤트 목록 조회
 */
export async function fetchAllEventsForAdmin(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name, is_verified)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchAllEventsForAdmin] error:', error)
    return []
  }

  return (data ?? []) as Event[]
}

/**
 * 이벤트 상단 고정 여부 토글
 */
export async function toggleEventFeatured(eventId: string, isFeatured: boolean) {
  const { error } = await supabase
    .from('events')
    .update({ is_featured: isFeatured })
    .eq('id', eventId)

  if (error) {
    console.error('[toggleEventFeatured] error:', error)
    return false
  }
  return true
}

/**
 * 기존 이벤트를 복제하여 새로운 날짜로 등록합니다.
 * 관리자용 기능으로, 즉시 'approved' 상태로 생성됩니다.
 */
export async function duplicateEvent(original: Event, newStartAt: string): Promise<boolean> {
  // parseISO를 사용하여 안전하게 날짜 객체 생성
  const startDate = parseISO(newStartAt)
  
  // 새로운 종료 시간 계산 (기존 간격 유지 또는 기본 1시간)
  let endDate: Date
  if (original.start_at && original.end_at) {
    const duration = parseISO(original.end_at).getTime() - parseISO(original.start_at).getTime()
    endDate = new Date(startDate.getTime() + duration)
  } else {
    endDate = addHours(startDate, 1)
  }

  // 삽입할 데이터 객체를 명시적으로 생성 (view 필드 등 불필요한 필드 제거)
  const insertData = {
    host_id: original.host_id,
    title: original.title,
    description: original.description,
    category: original.category,
    start_at: startDate.toISOString(),
    end_at: endDate.toISOString(),
    location_type: original.location_type,
    location_name: original.location_name,
    location_address: original.location_address,
    max_participants: original.max_participants,
    fee: original.fee,
    image_url: original.image_url,
    church_name: original.church_name,
    is_recurring: original.is_recurring || false,
    recurrence_rule: original.recurrence_rule || 'none',
    region: original.region || '전국',
    denomination: original.denomination || '',
    external_link: original.external_link || null,
    status: 'approved', // 관리자가 등록하므로 즉시 승인
    is_featured: false, // 재등록 시 상단 고정은 초기화
    donation_status: 'none', // 후원 상태 초기화
    donation_proof_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reviewed_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('events')
    .insert(insertData)

  if (error) {
    console.error('[duplicateEvent] error details:', error)
    return false
  }
  return true
}
