import { NextRequest, NextResponse } from 'next/server'
import { getBotJobLogs } from '@/lib/bots/supabase'
import { getBotSupabase } from '@/lib/bots/supabase'

export const dynamic = 'force-dynamic'

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  try {
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return false
    return decoded.startsWith('admin:') && decoded.endsWith(`:${adminPassword}`)
  } catch {
    return false
  }
}

// GET /api/admin/ops?type=newsbot&limit=50&page=1&kind=jobs|events
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const botType = (searchParams.get('type') || 'all') as 'newsbot' | 'radarbot' | 'all'
  const kind = searchParams.get('kind') || 'jobs'   // 'jobs' | 'events'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  try {
    if (kind === 'events') {
      const supabase = getBotSupabase()
      let query = supabase
        .from('ops_events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (botType !== 'all') {
        query = query.eq('bot_type', botType)
      }

      const { data, error, count } = await query
      if (error) throw new Error(error.message)

      return NextResponse.json({
        items: data || [],
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      })
    }

    // kind === 'jobs' (default)
    const result = await getBotJobLogs(botType, limit, offset)
    return NextResponse.json({
      items: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/ops] GET 실패:', msg)
    return NextResponse.json({ error: '운영 로그 조회 실패' }, { status: 500 })
  }
}
