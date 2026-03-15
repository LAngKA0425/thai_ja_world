import { NextRequest, NextResponse } from 'next/server'
import { getShopItems } from '@/lib/mock-db'
import { apiMessages } from '@/lib/api-messages'

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') || undefined
    const items = getShopItems(category as any)

    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
        isLimited: item.isLimited,
        isActive: item.isActive,
      })),
    })
  } catch (error) {
    console.error('Get shop items error:', error)
    return NextResponse.json(
      { message: apiMessages.errors.serverError },
      { status: 500 }
    )
  }
}
