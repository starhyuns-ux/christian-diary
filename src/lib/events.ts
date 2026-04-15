import { supabase } from '@/lib/supabase'
import { Event, EventCategory } from '@/types'

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
      host:users(id, name, avatar_url, church_name)
    `)
    .eq('status', 'approved')
    .gte('end_at', new Date().toISOString()) // 종료되지 않은 이벤트만
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
  const { data, error } = await supabase
    .from('events_with_count')
    .select(`
      *,
      host:users(id, name, avatar_url, church_name)
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
  payload: Omit<Event, 'id' | 'status' | 'platform_fee_rate' | 'admin_note' | 'reviewed_at' | 'created_at' | 'participant_count' | 'host'>
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('events')
    .insert({ ...payload, status: 'pending' })
    .select('id')
    .single()

  if (error) {
    console.error('[createEvent] error:', error)
    return null
  }

  return data
}

/**
 * 이벤트 참가 신청
 */
export async function joinEvent(eventId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('event_participants')
    .insert({ event_id: eventId, user_id: userId, status: 'confirmed' })

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
    .from('events')
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
