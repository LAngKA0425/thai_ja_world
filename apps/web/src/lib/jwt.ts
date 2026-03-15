import { SignJWT, jwtVerify } from 'jose'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('[FATAL] JWT_SECRET 환경변수가 설정되지 않았습니다. production 환경에서는 반드시 설정해야 합니다.')
}
const secret = new TextEncoder().encode(
  jwtSecret || 'dev-secret-key-DO-NOT-USE-IN-PRODUCTION'
)

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}
