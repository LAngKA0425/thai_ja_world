import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

interface Notice {
  id: string
  title: string
  content: string
  authorId: string
  authorNickname: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

const notices: Notice[] = []

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

    const activeNotices = notices.filter((n) => n.isActive)

    return NextResponse.json({
      notices: activeNotices.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    })
  } catch (error) {
    console.error('Get notices error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용이 필요합니다' },
        { status: 400 }
      )
    }

    const notice: Notice = {
      id: `notice-${Date.now()}`,
      title,
      content,
      authorId: payload.userId,
      authorNickname: adminUser.nickname,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }

    notices.push(notice)

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Create notice error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
