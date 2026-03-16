/**
 * Slack Ops Webhook Sender
 *
 * Incoming Webhook 기반 슬랙 메시지 전송 모듈.
 * 환경변수 SLACK_OPS_WEBHOOK_URL 필요.
 * 없으면 콘솔 로그만 남기고 앱은 정상 동작.
 */

export type OpsSeverity = 'CRITICAL' | 'HIGH' | 'INFO'

export interface OpsSlackMessage {
  severity: OpsSeverity
  title: string
  fields: Record<string, string | number | boolean>
}

const SEVERITY_EMOJI: Record<OpsSeverity, string> = {
  CRITICAL: ':rotating_light:',
  HIGH: ':warning:',
  INFO: ':white_check_mark:',
}

function getWebhookUrl(): string | null {
  const url = process.env.SLACK_OPS_WEBHOOK_URL
  if (!url || url.trim() === '') {
    return null
  }
  return url.trim()
}

function formatSlackText(msg: OpsSlackMessage): string {
  const emoji = SEVERITY_EMOJI[msg.severity]
  const lines: string[] = []
  lines.push(`${emoji} *[${msg.severity}] ${msg.title}*`)
  for (const [key, value] of Object.entries(msg.fields)) {
    lines.push(`- ${key}: ${value}`)
  }
  return lines.join('\n')
}

export async function sendOpsSlackMessage(msg: OpsSlackMessage): Promise<{ sent: boolean; error?: string }> {
  const webhookUrl = getWebhookUrl()

  if (!webhookUrl) {
    console.log(`[ops-slack][no-webhook] ${msg.severity} | ${msg.title}`, msg.fields)
    return { sent: false, error: 'SLACK_OPS_WEBHOOK_URL not configured' }
  }

  const text = formatSlackText(msg)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[ops-slack] webhook returned ${res.status}: ${body}`)
      return { sent: false, error: `webhook returned ${res.status}` }
    }

    return { sent: true }
  } catch (err: any) {
    const message = err?.name === 'AbortError' ? 'webhook timeout (10s)' : (err?.message || 'unknown error')
    console.error(`[ops-slack] send failed: ${message}`)
    return { sent: false, error: message }
  }
}

export function buildOpsMessage(severity: OpsSeverity, title: string, fields: Record<string, string | number | boolean>): OpsSlackMessage {
  return { severity, title, fields }
}
