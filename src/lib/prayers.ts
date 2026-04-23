import { supabase } from './supabase'
import { Prayer } from '@/types'

/**
 * 모든 기도제목을 가져옵니다.
 * @param currentUserId 현재 로그인한 사용자의 ID (아멘 여부 확인용)
 */
export async function fetchPrayers(currentUserId?: string): Promise<Prayer[]> {
  const { data, error } = await supabase
    .from('prayers')
    .select(`
      *,
      user:users(id, name, avatar_url, church_name),
      prayer_amens(user_id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchPrayers] error:', error)
    return []
  }

  return (data || []).map(p => ({
    ...p,
    amen_count: p.prayer_amens?.length || 0,
    is_amened: currentUserId ? p.prayer_amens?.some((a: any) => a.user_id === currentUserId) : false
  })) as Prayer[]
}

/**
 * 기도제목 등록
 */
export async function createPrayer(content: string, userId: string | null, guestName?: string | null): Promise<boolean> {
  const { error } = await supabase
    .from('prayers')
    .insert({ content, user_id: userId, guest_name: guestName })

  if (error) {
    console.error('[createPrayer] error:', error)
    return false
  }
  return true
}

/**
 * 아멘 토글 (좋아요/취소)
 */
export async function toggleAmen(prayerId: string, userId: string | null, isCurrentlyAmened: boolean): Promise<boolean> {
  if (isCurrentlyAmened && userId) {
    const { error } = await supabase
      .from('prayer_amens')
      .delete()
      .eq('prayer_id', prayerId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('[toggleAmen] delete error:', error)
      return false
    }
  } else {
    // 로그인이 안 되어 있거나 아멘을 추가하는 경우
    const { error } = await supabase
      .from('prayer_amens')
      .insert({ prayer_id: prayerId, user_id: userId || null })
    
    if (error) {
      console.error('[toggleAmen] insert error:', error)
      return false
    }
  }
  return true
}

/**
 * 기도제목 수정
 */
export async function updatePrayer(prayerId: string, content: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prayers')
    .update({ content })
    .eq('id', prayerId)
    .eq('user_id', userId)

  if (error) {
    console.error('[updatePrayer] error:', error)
    return false
  }
  return true
}

/**
 * 기도제목 삭제
 */
export async function deletePrayer(prayerId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prayers')
    .delete()
    .eq('id', prayerId)
    .eq('user_id', userId)

  if (error) {
    console.error('[deletePrayer] error:', error)
    return false
  }
  return true
}
