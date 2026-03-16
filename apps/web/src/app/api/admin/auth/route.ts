import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD || 'taeja2026admin'

  if (password === adminPassword) {
    const token = Buffer.from(`admin:${Date.now()}:${adminPassword}`).toString('base64')
    return NextResponse.json({ success: true, token })
  }

  return NextResponse.json({ success: false, error: '비밀번호가 틀립니다' }, { status: 401 })
}
