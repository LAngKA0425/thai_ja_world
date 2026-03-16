export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('ko-KR')
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

export function truncate(str: string, length: number = 50): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('active') || statusLower.includes('resolved')) {
    return '#10b981'
  }
  if (statusLower.includes('banned') || statusLower.includes('dismissed')) {
    return '#ef4444'
  }
  if (statusLower.includes('pending') || statusLower.includes('reviewing')) {
    return '#f59e0b'
  }
  if (statusLower.includes('draft')) {
    return '#94a3b8'
  }
  if (statusLower.includes('approved')) {
    return '#3b82f6'
  }
  if (statusLower.includes('published')) {
    return '#8b5cf6'
  }
  return '#64748b'
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    active: '활성',
    inactive: '비활성',
    banned: '차단됨',
    muted: '뮤트',
    warning: '경고',
    pending: '대기 중',
    reviewed: '검토됨',
    resolved: '해결됨',
    dismissed: '기각됨',
    normal: '일반',
    premium: '프리미엄',
    draft: '초안',
    approved: '승인됨',
    published: '발행됨',
  }
  return statusMap[status.toLowerCase()] || status
}
