import { NextRequest, NextResponse } from 'next/server'

/**
 * ───────────────────────────────────────────────────────────────────────────
 *  Zigbee2MQTT 照明連携 (OLEDWorks Brite 3 / 電球色 3000K 固定)
 * ───────────────────────────────────────────────────────────────────────────
 *
 *  Zigbee2MQTT の正式な制御方法は MQTT です（汎用 REST API は存在しません）。
 *  本ルートは MQTT ブローカー (Mosquitto 等) に接続し、以下のトピックへ publish します:
 *
 *      zigbee2mqtt/<friendly_name>/set
 *      payload: {"state":"ON","brightness":0-254,"transition":1}
 *
 *  Brite 3 は色温度固定のため color_temp は送信しません（state と brightness のみ）。
 *
 *  必要な環境変数 (.env.local / Vercel Environment Variables):
 *    ZIGBEE_MQTT_URL       MQTT ブローカー URL  例: mqtt://192.168.1.50:1883
 *    ZIGBEE_MQTT_USERNAME  ブローカー認証ユーザー名 (任意)
 *    ZIGBEE_MQTT_PASSWORD  ブローカー認証パスワード (任意)
 *    ZIGBEE_BASE_TOPIC     ベーストピック (既定: zigbee2mqtt)
 *    ZIGBEE_DEVICES        ゾーン→friendly_name の JSON マップ
 *                          例: {"all":"lumina_all","living":"lumina_living", ...}
 *                          "all" は全灯を束ねる Zigbee グループの friendly_name
 *
 *  ZIGBEE_MQTT_URL が未設定の場合はシミュレーションモードで動作し、
 *  UI は通常どおり反応しますが実際の照明には送信しません（ハード無しでデモ可能）。
 *
 *  ※ Node ランタイムが必須（TCP ソケットを使うため Edge では動作しません）
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ZigbeeCommand {
  state?: 'ON' | 'OFF'
  brightness?: number // 0–254
  transition?: number // 秒
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

function getBaseTopic(): string {
  return (process.env.ZIGBEE_BASE_TOPIC ?? 'zigbee2mqtt').replace(/\/$/, '')
}

// ── MQTT singleton (サーバーレス再実行間で接続を再利用) ──────────────────────
type MqttClientLike = {
  connected: boolean
  publish: (topic: string, msg: string, cb?: (err?: Error) => void) => void
  end: (force?: boolean) => void
}

declare global {
  // eslint-disable-next-line no-var
  var __zigbeeMqttClient: MqttClientLike | null | undefined
}

async function getMqttClient(): Promise<MqttClientLike | null> {
  const url = process.env.ZIGBEE_MQTT_URL
  if (!url) return null

  if (global.__zigbeeMqttClient?.connected) {
    return global.__zigbeeMqttClient
  }

  try {
    // 動的 import: mqtt 未インストールでもアプリ全体は起動できる（シミュレーション動作）
    const mqttModule = await import('mqtt').catch(() => null)
    if (!mqttModule) return null
    const mqtt = (mqttModule as any).default ?? mqttModule

    const client: MqttClientLike = await new Promise((resolve, reject) => {
      const c = mqtt.connect(url, {
        username: process.env.ZIGBEE_MQTT_USERNAME || undefined,
        password: process.env.ZIGBEE_MQTT_PASSWORD || undefined,
        connectTimeout: 3000,
        reconnectPeriod: 0,
        clientId: `luminafuji_${Math.random().toString(16).slice(2, 10)}`,
      })
      c.on('connect', () => resolve(c))
      c.on('error', (err: Error) => {
        c.end(true)
        reject(err)
      })
      setTimeout(() => reject(new Error('MQTT connect timeout')), 3500)
    })

    global.__zigbeeMqttClient = client
    return client
  } catch {
    global.__zigbeeMqttClient = null
    return null
  }
}

async function publishCommand(friendlyName: string, command: ZigbeeCommand): Promise<boolean> {
  const client = await getMqttClient()
  if (!client) return false

  const topic = `${getBaseTopic()}/${friendlyName}/set`
  return new Promise((resolve) => {
    client.publish(topic, JSON.stringify(command), (err) => resolve(!err))
  })
}

// ── GET: 接続ステータス ──────────────────────────────────────────────────────
export async function GET() {
  if (!process.env.ZIGBEE_MQTT_URL) {
    return NextResponse.json({
      connected: false,
      simulated: true,
      reason: 'ZIGBEE_MQTT_URL not set',
    })
  }

  const client = await getMqttClient()
  return NextResponse.json({
    connected: !!client?.connected,
    simulated: !client?.connected,
    baseTopic: getBaseTopic(),
  })
}

// ── POST: 照明コマンド送信 ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.command) {
    return NextResponse.json({ success: false, error: 'Missing command' }, { status: 400 })
  }

  const zone: string = body.zone ?? 'all'
  const raw = body.command as { state?: 'ON' | 'OFF'; brightness?: number }

  // Brite 3 は色温度固定 → state / brightness / transition のみを送信
  const command: ZigbeeCommand = {
    state: raw.state ?? (raw.brightness && raw.brightness > 0 ? 'ON' : 'OFF'),
    transition: 1,
  }
  if (typeof raw.brightness === 'number') {
    command.brightness = Math.max(0, Math.min(254, Math.round(raw.brightness)))
  }

  // ブローカー未設定 → シミュレーション
  if (!process.env.ZIGBEE_MQTT_URL) {
    return NextResponse.json({ success: true, zigbee: false, simulated: true, zone, command })
  }

  const deviceMap = getDeviceMap()

  // 対象デバイスの解決
  let devices: string[]
  if (zone === 'all') {
    devices = deviceMap['all'] ? [deviceMap['all']] : Object.values(deviceMap).filter(Boolean)
  } else {
    const device = deviceMap[zone]
    if (!device) {
      return NextResponse.json(
        { success: false, error: `Zone "${zone}" not in ZIGBEE_DEVICES` },
        { status: 404 }
      )
    }
    devices = [device]
  }

  if (devices.length === 0) {
    return NextResponse.json({
      success: true,
      zigbee: false,
      simulated: true,
      reason: 'no devices configured',
    })
  }

  const results = await Promise.allSettled(devices.map((d) => publishCommand(d, command)))
  const allOk = results.every((r) => r.status === 'fulfilled' && r.value === true)

  return NextResponse.json({
    success: true,
    zigbee: allOk,
    simulated: !allOk,
    zone,
    devices,
    command,
  })
}
