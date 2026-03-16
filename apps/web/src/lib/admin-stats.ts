import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export interface AdminDashboardUser {
  id: string
  nickname: string
  email: string
  createdAt: string
  lastLoginAt: string | null
  lastActiveLabel: string
}

export interface AdminDashboardStats {
  totalUsers: number
  onlineUsers: number
  activeUsers24h: number
  newUsersToday: number
  postsToday: number
  commentsToday: number
  pendingReports: number
  recentUsers: AdminDashboardUser[]
  recentActiveUsers: AdminDashboardUser[]
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '접속 기록 없음'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}일 전`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}개월 전`
}

function mapUser(u: any): AdminDashboardUser {
  return {
    id: u.id,
    nickname: u.nickname || '',
    email: u.email || '',
    createdAt: u.createdAt || '',
    lastLoginAt: u.lastLoginAt || null,
    lastActiveLabel: formatRelativeTime(u.lastLoginAt),
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabase()
  const now = new Date()

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayISO = todayStart.toISOString()

  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

  const [
    totalUsersRes,
    onlineUsersRes,
    activeUsers24hRes,
    newUsersTodayRes,
    postsTodayRes,
    pendingReportsRes,
    recentUsersRes,
    recentActiveUsersRes,
    commentsSumRes,
  ] = await Promise.all([
    // 총 사용자 수
    supabase
      .from('User')
      .select('*', { count: 'exact', head: true }),

    // 현재 접속자 수 (최근 5분 이내 lastLoginAt)
    supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .gte('lastLoginAt', fiveMinAgo),

    // 24시간 활성 사용자 수
    supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .gte('lastLoginAt', twentyFourHoursAgo),

    // 오늘 가입자 수
    supabase
      .from('User')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', todayISO),

    // 오늘 게시글 수
    supabase
      .from('CommunityPost')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', todayISO),

    // 신고/관리 대기 건수
    supabase
      .from('Report')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),

    // 최근 가입 사용자 10명
    supabase
      .from('User')
      .select('id, nickname, email, createdAt, lastLoginAt')
      .order('createdAt', { ascending: false })
      .limit(10),

    // 최근 활동 사용자 10명
    supabase
      .from('User')
      .select('id, nickname, email, createdAt, lastLoginAt')
      .not('lastLoginAt', 'is', null)
      .order('lastLoginAt', { ascending: false })
      .limit(10),

    // 오늘 댓글 수: Comment 테이블 기준 정확한 집계
    supabase
      .from('Comment')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', todayISO),
  ])

  const commentsToday = commentsSumRes.count ?? 0

  return {
    totalUsers: totalUsersRes.count ?? 0,
    onlineUsers: onlineUsersRes.count ?? 0,
    activeUsers24h: activeUsers24hRes.count ?? 0,
    newUsersToday: newUsersTodayRes.count ?? 0,
    postsToday: postsTodayRes.count ?? 0,
    commentsToday,
    pendingReports: pendingReportsRes.count ?? 0,
    recentUsers: (recentUsersRes.data || []).map(mapUser),
    recentActiveUsers: (recentActiveUsersRes.data || []).map(mapUser),
  }
}

// lastLoginAt 갱신 (throttle: 최소 2분 간격)
const THROTTLE_MS = 2 * 60 * 1000

export async function updateLastSeen(userId: string): Promise<boolean> {
  const supabase = getSupabase()

  // 현재 lastLoginAt 확인
  const { data: user } = await supabase
    .from('User')
    .select('lastLoginAt')
    .eq('id', userId)
    .single()

  if (!user) return false

  const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : 0
  const now = Date.now()

  // throttle: 마지막 기록 후 2분 이상 지났을 때만 update
  if (now - lastLogin < THROTTLE_MS) {
    return false
  }

  const { error } = await supabase
    .from('User')
    .update({ lastLoginAt: new Date().toISOString() })
    .eq('id', userId)

  return !error
}
