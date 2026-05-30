/**
 * ───────────────────────────────────────────────────────────────────────────
 *  照明制御バックエンド抽象化レイヤー (サーバー専用)
 * ───────────────────────────────────────────────────────────────────────────
 *
 *  OLEDWorks Brite 3 を 2 つのプロトコルで制御できる:
 *
 *    ① Zigbee  … Zigbee2MQTT 経由で MQTT publish
 *                zigbee2mqtt/<friendly_name>/set  {"state","brightness":0-254,"transition"}
 *
 *    ② DALI-2  … DALI-2 IP ゲートウェイ (Lunatone DALI-2 IoT 等) へ HTTP POST
 *                arc power level (0-254, 対数調光カーブ) を送信
 *
 *  色温度は固定 (電球色 3000K) のため、いずれも state と明るさのみを送信する。
 *
 *  バックエンド選択は環境変数 LIGHTING_BACKEND で行う:
 *    auto (既定) … 設定済みのものを自動採用 (両方設定なら both)
 *    zigbee / dali / both / simulation
 *
 *  どのバックエンドも未設定/未到達の場合はシミュレーション動作 (実機に送信しない)。
 */

export type Backend = 'zigbee' | 'dali' | 'both' | 'simulation'
export type LightingState = 'ON' | 'OFF'

export interface LightingCommand {
  state: LightingState
  /** 明るさ 0–100 (%) */
  percent: number
}

// ── 明るさ変換 ───────────────────────────────────────────────────────────────

/** Zigbee は線形 0–254 */
export function percentToZigbeeLevel(percent: number): number {
  return Math.max(0, Math.min(254, Math.round((percent / 100) * 254)))
}

/**
 * DALI-2 arc power level (IEC 62386-102 対数調光カーブ)。
 *   level 254 = 100% 光出力 / level 1 = 0.1% / level 0 = 消灯
 *   output%(n) = 100 × 10^((n-254)×3/253)  →  逆関数で percent → level
 */
export function percentToDaliLevel(percent: number): number {
  if (percent <= 0) return 0
  const p = Math.max(0.1, Math.min(100, percent))
  const level = Math.round(254 + (253 / 3) * Math.log10(p / 100))
  return Math.max(1, Math.min(254, level))
}

// ── 設定ヘルパ ───────────────────────────────────────────────────────────────

interface DeviceMap {
  [zone: string]: string
}

function parseDevices(json: string | undefined): DeviceMap {
  try {
    return JSON.parse(json ?? '{}')
  } catch {
    return {}
  }
}

function zigbeeConfigured() {
  return !!process.env.ZIGBEE_MQTT_URL
}
function daliConfigured() {
  return !!process.env.DALI_GATEWAY_URL
}

/** 実際に使用するバックエンドを解決する */
export function resolveBackend(): Backend {
  const explicit = (process.env.LIGHTING_BACKEND ?? 'auto').toLowerCase()
  if (explicit === 'zigbee' || explicit === 'dali' || explicit === 'both' || explicit === 'simulation') {
    return explicit
  }
  // auto
  const z = zigbeeConfigured()
  const d = daliConfigured()
  if (z && d) return 'both'
  if (d) return 'dali'
  if (z) return 'zigbee'
  return 'simulation'
}

// ── Zigbee ドライバ (MQTT) ───────────────────────────────────────────────────

type MqttClientLike = {
  connected: boolean
  publish: (topic: string, msg: string, cb?: (err?: Error) => void) => void
  end: (force?: boolean) => void
}

declare global {
  // eslint-disable-next-line no-var
  var __zigbeeMqttClient: MqttClientLike | null | undefined
}

function zigbeeBaseTopic() {
  return (process.env.ZIGBEE_BASE_TOPIC ?? 'zigbee2mqtt').replace(/\/$/, '')
}

async function getMqttClient(): Promise<MqttClientLike | null> {
  const url = process.env.ZIGBEE_MQTT_URL
  if (!url) return null
  if (global.__zigbeeMqttClient?.connected) return global.__zigbeeMqttClient

  try {
    const mod = await import('mqtt').catch(() => null)
    if (!mod) return null
    const mqtt = (mod as any).default ?? mod
    const client: MqttClientLike = await new Promise((resolve, reject) => {
      const c = mqtt.connect(url, {
        username: process.env.ZIGBEE_MQTT_USERNAME || undefined,
        password: process.env.ZIGBEE_MQTT_PASSWORD || undefined,
        connectTimeout: 3000,
        reconnectPeriod: 0,
        clientId: `luminafuji_${Math.random().toString(16).slice(2, 10)}`,
      })
      c.on('connect', () => resolve(c))
      c.on('error', (err: Error) => { c.end(true); reject(err) })
      setTimeout(() => reject(new Error('MQTT connect timeout')), 3500)
    })
    global.__zigbeeMqttClient = client
    return client
  } catch {
    global.__zigbeeMqttClient = null
    return null
  }
}

async function zigbeeStatus(): Promise<boolean> {
  if (!zigbeeConfigured()) return false
  const c = await getMqttClient()
  return !!c?.connected
}

async function zigbeePublish(friendlyName: string, cmd: LightingCommand): Promise<boolean> {
  const client = await getMqttClient()
  if (!client) return false
  const payload = JSON.stringify({
    state: cmd.state,
    brightness: percentToZigbeeLevel(cmd.percent),
    transition: 1,
  })
  const topic = `${zigbeeBaseTopic()}/${friendlyName}/set`
  return new Promise((resolve) => client.publish(topic, payload, (err) => resolve(!err)))
}

function zigbeeDevices(): DeviceMap {
  return parseDevices(process.env.ZIGBEE_DEVICES)
}

async function zigbeeDispatch(zone: string, cmd: LightingCommand): Promise<boolean> {
  const map = zigbeeDevices()
  let targets: string[]
  if (zone === 'all') {
    targets = map['all'] ? [map['all']] : Object.values(map).filter(Boolean)
  } else {
    const d = map[zone]
    if (!d) return false
    targets = [d]
  }
  if (targets.length === 0) return false
  const results = await Promise.allSettled(targets.map((t) => zigbeePublish(t, cmd)))
  return results.every((r) => r.status === 'fulfilled' && r.value === true)
}

// ── DALI-2 ドライバ (HTTP IP ゲートウェイ) ───────────────────────────────────
//
//  DALI-2 IP ゲートウェイへの汎用 JSON コントラクト:
//
//    POST {DALI_GATEWAY_URL}{DALI_COMMAND_PATH | '/command'}
//    Authorization: Bearer {DALI_GATEWAY_TOKEN}   (任意)
//    Body: {
//      "target": "<addrspec>",   // DALI_DEVICES の値: "broadcast" | "group:0" | "short:5"
//      "command": "ARC",          // Direct Arc Power Control (DAPC)
//      "level": 0-254,            // DALI arc power level (対数)
//      "state": "ON" | "OFF",
//      "fadeTime": 1              // 秒
//    }
//
//  Lunatone DALI-2 IoT / dali2mqtt 等への適合方法は docs/LIGHTING_SETUP.md を参照。

function daliDevices(): DeviceMap {
  return parseDevices(process.env.DALI_DEVICES)
}

function daliBaseUrl() {
  return (process.env.DALI_GATEWAY_URL ?? '').replace(/\/$/, '')
}

async function daliSend(target: string, cmd: LightingCommand): Promise<boolean> {
  const base = daliBaseUrl()
  if (!base) return false
  const path = process.env.DALI_COMMAND_PATH ?? '/command'
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.DALI_GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${process.env.DALI_GATEWAY_TOKEN}`

  const body = JSON.stringify({
    target,
    command: 'ARC',
    level: percentToDaliLevel(cmd.percent),
    state: cmd.state,
    fadeTime: 1,
  })

  try {
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

async function daliStatus(): Promise<boolean> {
  const base = daliBaseUrl()
  if (!base) return false
  const path = process.env.DALI_HEALTH_PATH ?? '/status'
  const headers: Record<string, string> = {}
  if (process.env.DALI_GATEWAY_TOKEN) headers['Authorization'] = `Bearer ${process.env.DALI_GATEWAY_TOKEN}`
  try {
    const res = await fetch(`${base}${path}`, { headers, signal: AbortSignal.timeout(2500) })
    return res.ok
  } catch {
    return false
  }
}

async function daliDispatch(zone: string, cmd: LightingCommand): Promise<boolean> {
  const map = daliDevices()
  let targets: string[]
  if (zone === 'all') {
    targets = map['all'] ? [map['all']] : Object.values(map).filter(Boolean)
    if (targets.length === 0) targets = ['broadcast'] // 既定: 全アドレスへブロードキャスト
  } else {
    const d = map[zone]
    if (!d) return false
    targets = [d]
  }
  const results = await Promise.allSettled(targets.map((t) => daliSend(t, cmd)))
  return results.every((r) => r.status === 'fulfilled' && r.value === true)
}

// ── 公開 API ─────────────────────────────────────────────────────────────────

export interface DispatchResult {
  success: boolean
  backend: Backend
  /** 実機に送信できたか (false ならシミュレーション扱い) */
  live: boolean
  zone: string
  drivers: { zigbee?: boolean; dali?: boolean }
}

export async function dispatchCommand(zone: string, cmd: LightingCommand): Promise<DispatchResult> {
  const backend = resolveBackend()
  const drivers: { zigbee?: boolean; dali?: boolean } = {}

  if (backend === 'simulation') {
    return { success: true, backend, live: false, zone, drivers }
  }

  const tasks: Promise<void>[] = []
  if (backend === 'zigbee' || backend === 'both') {
    tasks.push(zigbeeDispatch(zone, cmd).then((ok) => { drivers.zigbee = ok }))
  }
  if (backend === 'dali' || backend === 'both') {
    tasks.push(daliDispatch(zone, cmd).then((ok) => { drivers.dali = ok }))
  }
  await Promise.all(tasks)

  const live = (drivers.zigbee ?? false) || (drivers.dali ?? false)
  return { success: true, backend, live, zone, drivers }
}

export interface StatusResult {
  backend: Backend
  connected: boolean
  drivers: { zigbee?: boolean; dali?: boolean }
}

export async function getStatus(): Promise<StatusResult> {
  const backend = resolveBackend()
  if (backend === 'simulation') {
    return { backend, connected: false, drivers: {} }
  }

  const drivers: { zigbee?: boolean; dali?: boolean } = {}
  const checks: Promise<void>[] = []
  if (backend === 'zigbee' || backend === 'both') {
    checks.push(zigbeeStatus().then((ok) => { drivers.zigbee = ok }))
  }
  if (backend === 'dali' || backend === 'both') {
    checks.push(daliStatus().then((ok) => { drivers.dali = ok }))
  }
  await Promise.all(checks)

  const connected = (drivers.zigbee ?? false) || (drivers.dali ?? false)
  return { backend, connected, drivers }
}
