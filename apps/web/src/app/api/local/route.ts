import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

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

// GET - 로컬 업소 목록
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const region = searchParams.get('region') || ''
  const id = searchParams.get('id') || ''

  // 단건 조회
  if (id) {
    const { data, error } = await supabase
      .from('LocalBusiness')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return NextResponse.json({ error: '업소를 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json(data)
  }

  let query = supabase
    .from('LocalBusiness')
    .select('*')
    .eq('isActive', true)
    .order('isRecommended', { ascending: false })
    .order('createdAt', { ascending: false })

  if (category && category !== 'all' && category !== '전체') {
    query = query.eq('category', category)
  }
  if (region && region !== 'all') {
    query = query.eq('region', region)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// POST - 업소 등록 (관리자)
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const supabase = getSupabase()
  const body = await request.json()
  const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

  const { data, error } = await supabase
    .from('LocalBusiness')
    .insert({
      id,
      name: body.name,
      category: body.category,
      region: body.region || '방콕',
      address: body.address || '',
      priceRange: body.priceRange || '',
      description: body.description || '',
      discount: body.discount || null,
      imageUrl: body.imageUrl || null,
      imageUrls: body.imageUrls || [],
      emoji: body.emoji || '🏪',
      phone: body.phone || '',
      lineId: body.lineId || '',
      kakaoId: body.kakaoId || '',
      mapUrl: body.mapUrl || '',
      tags: body.tags || [],
      isRecommended: body.isRecommended || false,
      hasDiscount: !!body.discount,
      isActive: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, business: data })
}

// PUT - 업소 수정 (관리자)
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const supabase = getSupabase()
  const body = await request.json()

  if (!body.id) {
    return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  }

  const updateData: any = { updatedAt: new Date().toISOString() }
  const fields = ['name', 'category', 'region', 'address', 'priceRange', 'description',
    'discount', 'imageUrl', 'imageUrls', 'emoji', 'phone', 'lineId', 'kakaoId', 'mapUrl',
    'tags', 'isRecommended', 'hasDiscount', 'isActive']

  fields.forEach(f => {
    if (body[f] !== undefined) updateData[f] = body[f]
  })

  const { data, error } = await supabase
    .from('LocalBusiness')
    .update(updateData)
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, business: data })
}

// DELETE - 업소 삭제 (관리자)
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  }

  const { error } = await supabase
    .from('LocalBusiness')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
