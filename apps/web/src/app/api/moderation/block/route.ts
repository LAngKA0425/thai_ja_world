import { NextRequest, NextResponse } from 'next/server'
import { findUserById } from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'

interface BlockRecord {
  id: string
  userId: string
  blockedUserId: string
  blockedUserNickname: string
  createdAt: string
}

const blocks = new Map<string, BlockRecord[]>()

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
    const { blockedUserId } = body

    if (!blockedUserId) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    if (blockedUserId === payload.userId) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    const blockedUser = findUserById(blockedUserId)
    if (!blockedUser) {
      return NextResponse.json(
        { message: apiMessages.errors.userNotFound },
        { status: 404 }
      )
    }

    if (!blocks.has(payload.userId)) {
      blocks.set(payload.userId, [])
    }

    const userBlocks = blocks.get(payload.userId)!
    const alreadyBlocked = userBlocks.some((b) => b.blockedUserId === blockedUserId)

    if (alreadyBlocked) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 409 }
      )
    }

    const blockRecord: BlockRecord = {
      id: `block-${Date.now()}`,
      userId: payload.userId,
      blockedUserId,
      blockedUserNickname: blockedUser.nickname,
      createdAt: new Date().toISOString(),
    }

    userBlocks.push(blockRecord)

    return NextResponse.json(
      {
        id: blockRecord.id,
        blockedUserId,
        createdAt: blockRecord.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Block error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { blockedUserId } = body

    if (!blockedUserId) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    const userBlocks = blocks.get(payload.userId)
    if (!userBlocks) {
      return NextResponse.json(
        { message: apiMessages.errors.notFound },
        { status: 404 }
      )
    }

    const index = userBlocks.findIndex((b) => b.blockedUserId === blockedUserId)
    if (index === -1) {
      return NextResponse.json(
        { message: apiMessages.errors.notFound },
        { status: 404 }
      )
    }

    userBlocks.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unblock error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const userBlocks = blocks.get(payload.userId) || []

    return NextResponse.json({
      blocks: userBlocks.map((b) => ({
        id: b.id,
        blockedUserId: b.blockedUserId,
        blockedUserNickname: b.blockedUserNickname,
        createdAt: b.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get blocks error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
