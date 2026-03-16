import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// GET /api/community/posts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase()
  const { id } = params

  // 조회수 증가
  try {
    await supabase.rpc('increment_view_count', { post_id: id })
  } catch {
    // RPC가 없으면 무시
  }

  const { data, error } = await supabase
    .from('CommunityPost')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: '게시글을 찾을 수 없습니다' }, { status: 404 })
  }

  const categoryLabels: Record<string, string> = {
    briefing: '태국뉴스', incident: '사건사고', local_tip: '생활정보',
    visa_info: '비자정보', job: '구인구직', market: '중고마켓',
    errand: '심부름', anonymous_tip: '익명제보',
  }

  return NextResponse.json({
    ...data,
    categoryLabel: categoryLabels[data.category] || data.category,
    author: data.authorId === 'newsbot-system' ? '뉴스봇' : (data.authorId || '익명'),
  })
}
