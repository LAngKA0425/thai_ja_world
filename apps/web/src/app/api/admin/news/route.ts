import { NextRequest, NextResponse } from 'next/server'
import { getNewsReviewQueue, getNewsBotStats } from '@/lib/bots/supabase'

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

// GET /api/admin/news?status=pending_review&page=1&limit=20
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = (searchParams.get('status') || 'pending_review') as 'pending_review' | 'approved' | 'hold' | 'failed' | 'published' | 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit
  const includeStats = searchParams.get('stats') === 'true'

  try {
    const [queueResult, stats] = await Promise.all([
      getNewsReviewQueue(status, limit, offset),
      includeStats ? getNewsBotStats() : Promise.resolve(null),
    ])

    return NextResponse.json({
      items: queueResult.items,
      total: queueResult.total,
      page,
      limit,
      totalPages: Math.ceil(queueResult.total / limit),
      ...(stats ? { stats } : {}),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[admin/news] GET 실패:', msg)
    return NextResponse.json({ error: '뉴스 리뷰 큐 조회 실패' }, { status: 500 })
  }
}
