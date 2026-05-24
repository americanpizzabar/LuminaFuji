import { NextRequest, NextResponse } from 'next/server'
import { sendInviteEmail } from '@/lib/email-sender'

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
  hits.push(now)
  rateLimitMap.set(ip, hits)
  return hits.length > RATE_LIMIT
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { to?: string; guestName?: string; checkIn?: string; checkOut?: string; inviteLink?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const to = body.to?.trim().toLowerCase()
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!body.inviteLink || !body.inviteLink.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid invite link' }, { status: 400 })
  }

  try {
    await sendInviteEmail({
      to,
      guestName: body.guestName ?? 'Guest',
      checkIn: body.checkIn ?? '',
      checkOut: body.checkOut ?? '',
      inviteLink: body.inviteLink,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'Email not configured') {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }
    console.error('sendInviteEmail error:', msg)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
