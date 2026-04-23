import { supabase } from './supabase'
import { Message } from '@/types'

/**
 * 메시지 전송
 */
export async function sendMessage(data: {
  sender_id: string
  receiver_id: string
  event_id: string | null
  content: string
}): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .insert(data)

  if (error) {
    console.error('[sendMessage] error:', error)
    return false
  }
  return true
}

/**
 * 받은 메시지 목록 조회
 */
export async function fetchReceivedMessages(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*)')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchReceivedMessages] error:', error)
    return []
  }
  return data || []
}

/**
 * 메시지 읽음 처리
 */
export async function markAsRead(messageId: string): Promise<boolean> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)

  if (error) {
    console.error('[markAsRead] error:', error)
    return false
  }
  return true
}
