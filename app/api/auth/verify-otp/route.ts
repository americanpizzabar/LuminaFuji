import { NextRequest, NextResponse } from 'next/server'
import { verifyOtpToken } from '@/lib/auth-otp'

export async function POST(request: NextRequest) {
  let body: { token?: string; otp?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { token, otp } = body
  if (!token || !otp) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // verifyOtpToken returns null if signature invalid, expired, or OTP mismatch
  let payload: { value: string; otpHash: string; expiresAt: number } | null
  try {
    payload = verifyOtpToken(token, otp.trim())
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  if (!payload) {
    // Distinguish expired vs invalid by re-parsing without OTP check
    // (keep it simple: return 'Invalid code' for all failures except detectable expiry)
    const dotIndex = token.indexOf('.')
    if (dotIndex !== -1) {
      try {
        const b64 = token.slice(0, dotIndex)
        const parsed = JSON.parse(Buffer.from(b64, 'base64url').toString())
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          return NextResponse.json({ error: 'Code expired' }, { status: 410 })
        }
      } catch {
        // ignore parse errors, fall through to Invalid code
      }
    }
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
  }

  return NextResponse.json({ success: true, value: payload.value })
}
