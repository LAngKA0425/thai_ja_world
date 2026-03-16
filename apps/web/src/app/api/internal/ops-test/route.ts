import { NextRequest, NextResponse } from 'next/server'
import { sendOpsSlackMessage, buildOpsMessage } from '@/lib/slack/sender'

export const dynamic = 'force-dynamic'

function verifyOpsSecret(request: NextRequest): boolean {
  const secret = process.env.OPS_SHARED_SECRET
  if (!secret || secret.trim() === '') {
    const host = request.headers.get('host') || ''
    return host.startsWith('localhost') || host.startsWith('127.0.0.1')
  }
  const provided = request.headers.get('x-ops-secret') || ''
  return provided === secret.trim()
}

export async function POST(request: NextRequest) {
  if (!verifyOpsSecret(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  const environment = process.env.OPS_ENVIRONMENT || process.env.NODE_ENV || 'unknown'

  const result = await sendOpsSlackMessage(
    buildOpsMessage('INFO', 'ops test message — radar bot is alive', {
      environment,
      triggered_by: 'manual',
      timestamp: new Date().toISOString(),
    })
  )

  return NextResponse.json({
    sent: result.sent,
    error: result.error || null,
    environment,
  })
}
