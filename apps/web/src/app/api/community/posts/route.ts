import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// GET /api/community/posts?category=briefing&limit=10&sort=latest
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sort = searchParams.get('sort') || 'latest' // latest | popular
  const section = searchParams.get('section') // briefing | latest | popular

  let query = supabase
    .from('CommunityPost')
    .select('*')
    .eq('moderationStatus', 'SAFE')

  // 카테고리 필터
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // 섹션별 특수 처리
  if (section === 'briefing') {
    // 오늘의 브리핑: briefing 카테고리, 최신순
    query = query.in('category', ['briefing', 'local_tip', 'visa_info', 'incident'])
    query = query.order('createdAt', { ascending: false })
    query = query.limit(5)
  } else if (section === 'popular') {
    // 인기글: 조회수 기준
    query = query.order('viewCount', { ascending: false })
    query = query.limit(5)
  } else if (sort === 'popular') {
    query = query.order('viewCount', { ascending: false })
  } else {
    query = query.order('createdAt', { ascending: false })
  }

  query = query.limit(Math.min(limit, 50))

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 카테고리 → 한국어 매핑
  const categoryLabels: Record<string, string> = {
    briefing: '태국뉴스',
    incident: '사건사고',
    local_tip: '생활정보',
    visa_info: '비자정보',
    job: '구인구직',
    market: '중고마켓',
    errand: '심부름',
    anonymous_tip: '익명제보',
  }

  const categoryColors: Record<string, string> = {
    briefing: 'bg-[#145A46]',
    incident: 'text-red-500',
    local_tip: 'bg-[#F2994A]',
    visa_info: 'bg-[#2563EB]',
    job: 'text-[#7C3AED]',
    market: 'text-[#145A46]',
  }

  const posts = (data || []).map((post: any) => {
    // 시간 표시
    const created = new Date(post.createdAt)
    const now = new Date()
    const diffMin = Math.floor((now.getTime() - created.getTime()) / 60000)
    let timeStr = ''
    if (diffMin < 1) timeStr = '방금 전'
    else if (diffMin < 60) timeStr = `${diffMin}분 전`
    else if (diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)}시간 전`
    else timeStr = created.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })

    // 요약 (content 첫 줄)
    const firstLine = (post.content || '').split('\n').filter((l: string) => l.trim())[0] || ''

    return {
      id: post.id,
      category: post.category,
      categoryLabel: categoryLabels[post.category] || post.category,
      categoryColor: categoryColors[post.category] || 'bg-gray-500',
      title: post.title,
      summary: firstLine.substring(0, 80),
      content: post.content,
      author: post.authorId === 'newsbot-system' ? '뉴스봇' : (post.authorId || '익명'),
      time: timeStr,
      views: post.viewCount || 0,
      comments: post.commentCount || 0,
      createdAt: post.createdAt,
    }
  })

  return NextResponse.json(posts)
}
