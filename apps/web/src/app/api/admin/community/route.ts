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

// GET - 전체 게시글 목록 (검색/필터 지원)
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20

  let query = supabase
    .from('CommunityPost')
    .select('*', { count: 'exact' })
    .order('createdAt', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    posts: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  })
}

// PUT - 게시글 수정
export async function PUT(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const supabase = getSupabase()
  const body = await request.json()
  const { id, title, content, category, moderationStatus } = body

  if (!id) {
    return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  }

  const updateData: any = { updatedAt: new Date().toISOString() }
  if (title !== undefined) updateData.title = title
  if (content !== undefined) updateData.content = content
  if (category !== undefined) updateData.category = category
  if (moderationStatus !== undefined) updateData.moderationStatus = moderationStatus

  const { data, error } = await supabase
    .from('CommunityPost')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, post: data })
}

// DELETE - 게시글 삭제
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
    .from('CommunityPost')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
