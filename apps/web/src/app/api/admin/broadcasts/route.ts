import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

interface BroadcastLog {
  id: string
  userId: string
  nickname: string
  message: string
  createdAt: string
}

const broadcastLogs: BroadcastLog[] = []

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { message: '인증 토큰이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    const adminUser = findUserById(payload.userId)
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { message: '관리자만 접근 가능합니다' },
        { status: 403 }
      )
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
    const logs = broadcastLogs.slice(0, limit)

    return NextResponse.json({
      broadcasts: logs,
      total: broadcastLogs.length,
    })
  } catch (error) {
    console.error('Get broadcast logs error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
