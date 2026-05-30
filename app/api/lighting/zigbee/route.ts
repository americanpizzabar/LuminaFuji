import { NextRequest, NextResponse } from 'next/server'

/**
 * Zigbee2MQTT integration via HTTP REST API.
 *
 * Required env vars (set on the home server / Vercel):
 *   ZIGBEE_BRIDGE_URL   — e.g. http://192.168.1.100:8080   (Zigbee2MQTT frontend URL)
 *   ZIGBEE_API_TOKEN    — optional auth token for the bridge
 *   ZIGBEE_DEVICES      — JSON map of zone → friendly name
 *                         e.g. {"living":"living_light","bedroom":"bedroom_light","all":"group_all"}
 *
 * If ZIGBEE_BRIDGE_URL is not set the route returns simulated=true and still
 * reports success, so the UI works in demo mode without any hardware.
 */

interface ZigbeeCommand {
  state?: 'ON' | 'OFF'
  brightness?: number   // 0–254
  color_temp?: number   // Mireds (154–500)
}

interface DeviceMap {
  [zone: string]: string
}

function getDeviceMap(): DeviceMap {
  try {
    return JSON.parse(process.env.ZIGBEE_DEVICES ?? '{}')
  } catch {
    return {}
  }
}

async function sendToZigbee(deviceName: string, command: ZigbeeCommand): Promise<boolean> {
  const bridgeUrl = process.env.ZIGBEE_BRIDGE_URL
  if (!bridgeUrl) return false

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (process.env.ZIGBEE_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.ZIGBEE_API_TOKEN}`
  }

  // Zigbee2MQTT REST API: POST /api/devices/{friendlyName}/action
  const url = `${bridgeUrl.replace(/\/$/, '')}/api/devices/${encodeURIComponent(deviceName)}/action`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(3000),
  })

  return res.ok
}

// GET — health check / connection status
export async function GET() {
  const bridgeUrl = process.env.ZIGBEE_BRIDGE_URL

  if (!bridgeUrl) {
    return NextResponse.json({ connected: false, simulated: true, reason: 'ZIGBEE_BRIDGE_URL not set' })
  }

  try {
    const headers: Record<string, string> = {}
    if (process.env.ZIGBEE_API_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.ZIGBEE_API_TOKEN}`
    }
    const res = await fetch(`${bridgeUrl.replace(/\/$/, '')}/api/health`, {
      headers,
      signal: AbortSignal.timeout(2000),
    })
    return NextResponse.json({ connected: res.ok, simulated: false })
  } catch {
    return NextResponse.json({ connected: false, simulated: true, reason: 'bridge unreachable' })
  }
}

// POST — send lighting command to one or all zones
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.command) {
    return NextResponse.json({ success: false, error: 'Missing command' }, { status: 400 })
  }

  const zone: string = body.zone ?? 'all'
  const command: ZigbeeCommand = body.command

  const bridgeUrl = process.env.ZIGBEE_BRIDGE_URL
  if (!bridgeUrl) {
    // Simulated — just echo success
    return NextResponse.json({ success: true, zigbee: false, simulated: true, zone, command })
  }

  const deviceMap = getDeviceMap()

  // Determine which device(s) to control
  let devicesToControl: string[]

  if (zone === 'all') {
    const allDevice = deviceMap['all']
    if (allDevice) {
      devicesToControl = [allDevice]
    } else {
      // Control every individual zone
      devicesToControl = Object.values(deviceMap).filter(Boolean)
    }
  } else {
    const device = deviceMap[zone]
    if (!device) {
      return NextResponse.json({
        success: false,
        error: `Zone "${zone}" not found in ZIGBEE_DEVICES`,
      }, { status: 404 })
    }
    devicesToControl = [device]
  }

  if (devicesToControl.length === 0) {
    return NextResponse.json({ success: true, zigbee: false, simulated: true, reason: 'no devices configured' })
  }

  const results = await Promise.allSettled(
    devicesToControl.map(device => sendToZigbee(device, command))
  )

  const allOk = results.every(r => r.status === 'fulfilled' && r.value === true)

  return NextResponse.json({
    success: true,
    zigbee: allOk,
    simulated: !allOk,
    zone,
    devices: devicesToControl,
  })
}
