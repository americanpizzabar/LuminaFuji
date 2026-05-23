import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createOtpToken } from '@/lib/auth-otp'
import { sendOtpEmail } from '@/lib/email-sender'

// In-memory rate limiting: ip → [timestamps]
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  hits.push(now)
  rateLimitMap.set(ip, hits)
  return hits.length > RATE_LIMIT
}

function maskEmail(e: string): string {
  const [u, d] = e.split('@')
  if (!u || !d) return e
  if (u.length <= 2) return `${u[0]}*@${d}`
  return `${u[0]}${'*'.repeat(u.length - 2)}${u.slice(-1)}@${d}`
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { value?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const value = body.value?.trim().toLowerCase()
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const otp = String(crypto.randomInt(100000, 1000000))
  const { token, expiresAt } = createOtpToken({ value, otp })

  try {
    await sendOtpEmail(value, otp)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'Email not configured') {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }
    console.error('sendOtpEmail error:', msg)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ token, expiresAt, maskedValue: maskEmail(value) })
}
