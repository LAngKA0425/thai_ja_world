const DEFAULT_LOCAL_BACKEND_URL = 'http://localhost:8000'
const DEFAULT_DOCKER_BACKEND_URL = 'http://backend:8000'

export function getBackendInternalUrl(): string {
  if (process.env.BACKEND_INTERNAL_URL && process.env.BACKEND_INTERNAL_URL.trim() !== '') {
    return process.env.BACKEND_INTERNAL_URL
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_DOCKER_BACKEND_URL
  }

  return DEFAULT_LOCAL_BACKEND_URL
}

export function getBackendInternalSecret(): string {
  return (
    process.env.BACKEND_INTERNAL_SECRET ||
    process.env.SECRET_KEY ||
    process.env.NEXTAUTH_SECRET ||
    ''
  )
}
