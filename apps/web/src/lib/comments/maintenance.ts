const MAINTENANCE_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])

function asFlag(value: string | undefined): boolean {
  if (!value) return false
  return MAINTENANCE_TRUE_VALUES.has(value.trim().toLowerCase())
}

export function isCommentWriteMaintenanceEnabled(): boolean {
  return (
    asFlag(process.env.COMMENTS_WRITE_DISABLED) ||
    asFlag(process.env.COMMENTS_MAINTENANCE_MODE)
  )
}

export function getCommentWriteMaintenanceMessage(): string {
  return '댓글 기능 점검 중입니다. 잠시 후 다시 시도해 주세요.'
}
