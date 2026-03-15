import { NextRequest, NextResponse } from 'next/server'
import {
  findUserById,
  findShopItem,
  removeInventoryItem,
  updateUser,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'
import { apiMessages } from '@/lib/api-messages'

interface Broadcast {
  id: string
  userId: string
  nickname: string
  message: string
  createdAt: string
}

const broadcasts: Broadcast[] = []
const broadcastCooldowns = new Map<string, number>()

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

    const user = findUserById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { message: apiMessages.errors.userNotFound },
        { status: 404 }
      )
    }

    // Check cooldown (5 minutes)
    const lastBroadcast = broadcastCooldowns.get(payload.userId)
    if (lastBroadcast && Date.now() - lastBroadcast < 5 * 60 * 1000) {
      const remainingSeconds = Math.ceil((5 * 60 * 1000 - (Date.now() - lastBroadcast)) / 1000)
      return NextResponse.json(
        { message: `${remainingSeconds}${apiMessages.broadcast.cooldownMessage}` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    if (message.length > 200) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    // Check if user has broadcast item
    const hasBroadcastItem = user.gems >= 100 // Alternative: check inventory for broadcast item
    if (!hasBroadcastItem) {
      return NextResponse.json(
        { message: apiMessages.errors.badRequest },
        { status: 400 }
      )
    }

    // Create broadcast
    const broadcast: Broadcast = {
      id: `broadcast-${Date.now()}`,
      userId: payload.userId,
      nickname: user.nickname,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    }

    broadcasts.unshift(broadcast)
    broadcastCooldowns.set(payload.userId, Date.now())

    // Remove 1 point
    updateUser(payload.userId, {
      points: Math.max(0, user.points - 10),
    })

    return NextResponse.json(broadcast, { status: 201 })
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const activeBroadcasts = broadcasts.slice(0, limit)

    return NextResponse.json({
      broadcasts: activeBroadcasts,
    })
  } catch (error) {
    console.error('Get broadcasts error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
