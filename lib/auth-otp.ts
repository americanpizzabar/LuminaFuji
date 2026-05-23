import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET ?? 'dev-secret-CHANGE-IN-PROD-32chars!!'

type Payload = { value: string; otpHash: string; expiresAt: number }

export function createOtpToken({ value, otp }: { value: string; otp: string }): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 10 * 60 * 1000
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
  const payload: Payload = { value, otpHash, expiresAt }
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url')
  return { token: `${b64}.${sig}`, expiresAt }
}

export function verifyOtpToken(token: string, otp: string): Payload | null {
  const dotIndex = token.indexOf('.')
  if (dotIndex === -1) return null
  const b64 = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)
  if (!b64 || !sig) return null
  const expectedSig = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url')
  if (sig !== expectedSig) return null
  let payload: Payload
  try {
    payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
  } catch {
    return null
  }
  if (Date.now() > payload.expiresAt) return null
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
  if (otpHash !== payload.otpHash) return null
  return payload
}
