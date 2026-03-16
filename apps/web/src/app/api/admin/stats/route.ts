import { NextRequest, NextResponse } from 'next/server'
import { getAdminDashboardStats } from '@/lib/admin-stats'

export const dynamic = 'force-dynamic'

function verifyAdmin(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return false
  try {
    const decoded = Buffer.from(auth.replace('Bearer ', ''), 'base64').toString()
    const adminPassword = process.env.ADMIN_PASSWORD || 'taeja2026admin'
    return decoded.startsWith('admin:') && decoded.endsWith(`:${adminPassword}`)
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '관리자 인증이 필요합니다' }, { status: 403 })
  }

  try {
    const stats = await getAdminDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: '통계 데이터를 불러올 수 없습니다' },
      { status: 500 }
    )
  }
}
