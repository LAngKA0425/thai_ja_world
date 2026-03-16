import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const debug: any = {
    envCheck: {
      SUPABASE_URL_exists: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_KEY_exists: !!process.env.SUPABASE_SERVICE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url_used: url ? url.substring(0, 30) + '...' : 'EMPTY',
      key_used: key ? key.substring(0, 15) + '...' : 'EMPTY',
    }
  }

  if (!url || !key) {
    debug.error = 'Missing Supabase URL or Key'
    return NextResponse.json(debug)
  }

  try {
    const supabase = createClient(url, key)

    // 1) 필터 없이 전체 조회
    const { data: allData, error: allError } = await supabase
      .from('CommunityPost')
      .select('id, title, category, moderationStatus')
      .limit(10)

    debug.queryAll = {
      data: allData,
      error: allError?.message || null,
      count: allData?.length || 0
    }

    // 2) moderationStatus = SAFE 필터
    const { data: safeData, error: safeError } = await supabase
      .from('CommunityPost')
      .select('id, title, moderationStatus')
      .eq('moderationStatus', 'SAFE')
      .limit(10)

    debug.querySafe = {
      data: safeData,
      error: safeError?.message || null,
      count: safeData?.length || 0
    }
  } catch (e: any) {
    debug.exception = e.message
  }

  return NextResponse.json(debug, { status: 200 })
}
