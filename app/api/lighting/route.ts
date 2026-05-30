import { NextRequest, NextResponse } from 'next/server'
import { dispatchCommand, getStatus, LightingState } from '@/lib/lighting-control'

/**
 * 照明制御の統合エンドポイント (Zigbee / DALI-2 / シミュレーション)。
 * 制御ロジックは lib/lighting-control.ts に集約。
 *
 * Brite 3 は色温度固定のため、送信するのは state と明るさ(%)のみ。
 *
 * ※ TCP ソケット(MQTT)や fetch を使うため Node ランタイム必須。
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET — 接続ステータス
export async function GET() {
  const status = await getStatus()
  return NextResponse.json({
    backend: status.backend,
    connected: status.connected,
    simulated: !status.connected,
    drivers: status.drivers,
  })
}

// POST — 照明コマンド送信
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.command) {
    return NextResponse.json({ success: false, error: 'Missing command' }, { status: 400 })
  }

  const zone: string = body.zone ?? 'all'
  const raw = body.command as { state?: LightingState; percent?: number; brightness?: number }

  // percent (0-100) を優先。後方互換で brightness(0-254) も受理。
  let percent: number
  if (typeof raw.percent === 'number') {
    percent = raw.percent
  } else if (typeof raw.brightness === 'number') {
    percent = (raw.brightness / 254) * 100
  } else {
    percent = 0
  }
  percent = Math.max(0, Math.min(100, percent))

  const state: LightingState = raw.state ?? (percent > 0 ? 'ON' : 'OFF')

  const result = await dispatchCommand(zone, { state, percent })

  return NextResponse.json({
    success: result.success,
    backend: result.backend,
    live: result.live,
    simulated: !result.live,
    zone: result.zone,
    drivers: result.drivers,
  })
}
