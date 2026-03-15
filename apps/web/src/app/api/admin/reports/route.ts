import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

interface Report {
  id: string
  reporterId: string
  reporterNickname: string
  reportedUserId: string
  reportedUserNickname: string
  reason: string
  description?: string
  createdAt: string
  status: 'pending' | 'reviewed' | 'resolved'
}

const reports: Report[] = []

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

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { reportId, status } = body

    if (!reportId || !status) {
      return NextResponse.json(
        { message: '신고 ID와 상태가 필요합니다' },
        { status: 400 }
      )
    }

    const report = reports.find((r) => r.id === reportId)
    if (!report) {
      return NextResponse.json(
        { message: '신고를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    report.status = status

    return NextResponse.json({
      id: report.id,
      status: report.status,
    })
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
