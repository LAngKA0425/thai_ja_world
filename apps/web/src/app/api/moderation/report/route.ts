import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { message: apiMessages.auth.tokenRequired },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: apiMessages.auth.invalidToken },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reportedUserId, reason, description } = body

    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    const reporter = findUserById(payload.userId)
    const reported = findUserById(reportedUserId)

    if (!reporter || !reported) {
      return NextResponse.json(
        { message: apiMessages.errors.userNotFound },
        { status: 404 }
      )
    }

    if (reportedUserId === payload.userId) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    const report: Report = {
      id: `report-${Date.now()}`,
      reporterId: payload.userId,
      reporterNickname: reporter.nickname,
      reportedUserId,
      reportedUserNickname: reported.nickname,
      reason,
      description: description || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    reports.push(report)

    return NextResponse.json(
      {
        id: report.id,
        status: report.status,
        createdAt: report.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
