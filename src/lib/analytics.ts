import { supabase } from './supabase'

/**
 * 방문자 접속 기록
 */
export async function logVisit() {
  if (typeof window === 'undefined') return

  // 이번 세션에서 이미 기록했는지 확인
  const hasVisited = sessionStorage.getItem('site_visited')
  if (hasVisited) return

  try {
    const sessionId = Math.random().toString(36).substring(2)
    const { error } = await supabase
      .from('visitor_logs')
      .insert([{ session_id: sessionId }])

    if (!error) {
      sessionStorage.setItem('site_visited', 'true')
    }
  } catch (err) {
    console.error('[logVisit] Error:', err)
  }
}

/**
 * 방문자 통계 요약 가져오기
 */
export async function fetchVisitorStats() {
  try {
    // 1. 전체 방문자 수
    const { count: totalViews } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })

    // 2. 오늘 방문자 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayViews } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    return {
      totalViews: totalViews || 0,
      todayViews: todayViews || 0
    }
  } catch (err) {
    console.error('[fetchVisitorStats] Error:', err)
    return { totalViews: 0, todayViews: 0 }
  }
}
