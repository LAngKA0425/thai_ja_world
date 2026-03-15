import { NextRequest, NextResponse } from 'next/server'
import {
  findUserById,
  getMinihome,
  createMinihome,
  updateMinihome,
  getGuestbookEntries,
  getInventory,
  findShopItem,
} from '@/lib/mock-db'
import { extractToken, verifyToken } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = findUserById(params.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // Get or create minihome
    let minihome = getMinihome(params.userId)
    if (!minihome) {
      minihome = createMinihome(params.userId)
    }

    // Get guestbook entries
    const guestbookRaw = getGuestbookEntries(params.userId)
    const guestbook = guestbookRaw.map((entry) => ({
      id: entry.id,
      userId: entry.minihomeUserId,
      authorId: entry.authorId,
      authorNickname: entry.authorNickname,
      authorAvatar: entry.authorAvatar,
      content: entry.content,
      createdAt: entry.createdAt,
    }))

    // Get skin/bgm info
    let skinName: string | undefined
    let bgmName: string | undefined

    if (minihome.skinId) {
      const skinShopItem = findShopItem(minihome.skinId)
      skinName = skinShopItem?.name
    }
    if (minihome.bgmId) {
      const bgmShopItem = findShopItem(minihome.bgmId)
      bgmName = bgmShopItem?.name
    }

    return NextResponse.json({
      minihomeId: minihome.id,
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      character: user.character,
      visitCount: minihome.visitCount,
      isOnline: true,
      createdAt: user.createdAt,
      bio: minihome.bio,
      skinId: minihome.skinId,
      skinName,
      bgmId: minihome.bgmId,
      bgmName,
      guestbook,
      decorations: [],
    })
  } catch (error) {
    console.error('Get minihome error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    // Only owner can update
    if (payload.userId !== params.userId) {
      return NextResponse.json(
        { message: '권한이 없습니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { skinId, bgmId, bio, decorations } = body

    const updates: any = {}

    if (skinId !== undefined) {
      if (skinId === null) {
        updates.skinId = undefined
      } else {
        const inventory = getInventory(payload.userId)
        const ownsSkin = inventory.some((inv) => inv.shopItemId === skinId)
        if (!ownsSkin) {
          return NextResponse.json(
            { message: '보유하지 않은 스킨입니다' },
            { status: 400 }
          )
        }
        const invItem = inventory.find((inv) => inv.shopItemId === skinId)
        if (invItem?.expiresAt && new Date(invItem.expiresAt) < new Date()) {
          return NextResponse.json(
            { message: '만료된 스킨입니다' },
            { status: 400 }
          )
        }
        updates.skinId = skinId
      }
    }

    if (bgmId !== undefined) {
      if (bgmId === null) {
        updates.bgmId = undefined
      } else {
        const inventory = getInventory(payload.userId)
        const ownsBgm = inventory.some((inv) => inv.shopItemId === bgmId)
        if (!ownsBgm) {
          return NextResponse.json(
            { message: '보유하지 않은 BGM입니다' },
            { status: 400 }
          )
        }
        const invItem = inventory.find((inv) => inv.shopItemId === bgmId)
        if (invItem?.expiresAt && new Date(invItem.expiresAt) < new Date()) {
          return NextResponse.json(
            { message: '만료된 BGM입니다' },
            { status: 400 }
          )
        }
        updates.bgmId = bgmId
      }
    }

    if (bio !== undefined) {
      updates.bio = bio
    }

    const minihome = updateMinihome(params.userId, updates)
    if (!minihome) {
      return NextResponse.json(
        { message: '미니홈피를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    let skinName: string | undefined
    let bgmName: string | undefined

    if (minihome.skinId) {
      const skinShopItem = findShopItem(minihome.skinId)
      skinName = skinShopItem?.name
    }
    if (minihome.bgmId) {
      const bgmShopItem = findShopItem(minihome.bgmId)
      bgmName = bgmShopItem?.name
    }

    return NextResponse.json({
      skinId: minihome.skinId,
      skinName,
      bgmId: minihome.bgmId,
      bgmName,
      bio: minihome.bio,
      decorations: decorations || [],
    })
  } catch (error) {
    console.error('Update minihome error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
