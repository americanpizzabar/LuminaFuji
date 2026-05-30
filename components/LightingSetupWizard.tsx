'use client'

import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wifi, Zap, CheckCircle2, XCircle, RefreshCw, Copy, Check,
  ChevronRight, ChevronLeft, Lightbulb, Radio, Server,
  AlertCircle, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

type Protocol = 'zigbee' | 'dali' | 'both'
type ScanStatus = 'idle' | 'scanning' | 'connected' | 'partial' | 'failed'

interface ZigbeeConfig {
  mqttUrl: string
  username: string
  password: string
  baseTopic: string
  deviceAll: string
  deviceLiving: string
  deviceBedroom: string
  deviceBathroom: string
  deviceEntrance: string
}

interface DaliConfig {
  gatewayUrl: string
  token: string
  commandPath: string
  healthPath: string
  deviceAll: string
  deviceLiving: string
  deviceBedroom: string
  deviceBathroom: string
  deviceEntrance: string
}

const DEFAULT_ZIGBEE: ZigbeeConfig = {
  mqttUrl: 'mqtt://192.168.1.50:1883',
  username: 'lumina',
  password: '',
  baseTopic: 'zigbee2mqtt',
  deviceAll: 'lumina_all',
  deviceLiving: 'lumina_living',
  deviceBedroom: 'lumina_bedroom',
  deviceBathroom: 'lumina_bathroom',
  deviceEntrance: 'lumina_entrance',
}

const DEFAULT_DALI: DaliConfig = {
  gatewayUrl: 'http://192.168.1.60',
  token: '',
  commandPath: '/command',
  healthPath: '/status',
  deviceAll: 'broadcast',
  deviceLiving: 'group:0',
  deviceBedroom: 'group:1',
  deviceBathroom: 'group:2',
  deviceEntrance: 'group:3',
}

function generateEnvVars(protocol: Protocol, z: ZigbeeConfig, d: DaliConfig): string {
  const lines: string[] = [`LIGHTING_BACKEND=${protocol}`, '']
  if (protocol === 'zigbee' || protocol === 'both') {
    lines.push(
      '# ── Zigbee2MQTT ──────────────────────────────────────',
      `ZIGBEE_MQTT_URL=${z.mqttUrl}`,
      `ZIGBEE_MQTT_USERNAME=${z.username}`,
      `ZIGBEE_MQTT_PASSWORD=${z.password}`,
      `ZIGBEE_BASE_TOPIC=${z.baseTopic}`,
      `ZIGBEE_DEVICES={"all":"${z.deviceAll}","living":"${z.deviceLiving}","bedroom":"${z.deviceBedroom}","bathroom":"${z.deviceBathroom}","entrance":"${z.deviceEntrance}"}`,
      '',
    )
  }
  if (protocol === 'dali' || protocol === 'both') {
    lines.push(
      '# ── DALI-2 IP ゲートウェイ ───────────────────────────',
      `DALI_GATEWAY_URL=${d.gatewayUrl}`,
      `DALI_GATEWAY_TOKEN=${d.token}`,
      `DALI_COMMAND_PATH=${d.commandPath}`,
      `DALI_HEALTH_PATH=${d.healthPath}`,
      `DALI_DEVICES={"all":"${d.deviceAll}","living":"${d.deviceLiving}","bedroom":"${d.deviceBedroom}","bathroom":"${d.deviceBathroom}","entrance":"${d.deviceEntrance}"}`,
    )
  }
  return lines.join('\n')
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text', hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; hint?: string
}) {
  return (
    <div>
      <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-all"
      />
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  )
}

function SectionHeader({ icon, title, color }: { icon: ReactNode; title: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
    </div>
  )
}

// ─── Step 1: Protocol Selection ────────────────────────────────────────────────

function Step1({
  protocol, setProtocol, accentColor,
}: {
  protocol: Protocol | null
  setProtocol: (p: Protocol) => void
  accentColor: string
}) {
  const options: { id: Protocol; label: string; sub: string; icon: React.ReactNode; pros: string[] }[] = [
    {
      id: 'zigbee',
      label: 'Zigbee のみ',
      sub: '無線メッシュ接続（推奨）',
      icon: <Wifi size={22} className="text-cyan-400" />,
      pros: ['配線不要・後付け簡単', 'Zigbee2MQTT で制御', '最大 65,000 台対応'],
    },
    {
      id: 'dali',
      label: 'DALI-2 のみ',
      sub: '産業用有線プロトコル',
      icon: <Zap size={22} className="text-amber-400" />,
      pros: ['IEC 62386 対応', '高精度調光（254段階）', 'IP ゲートウェイ経由'],
    },
    {
      id: 'both',
      label: 'Zigbee + DALI-2',
      sub: '両プロトコル同時使用',
      icon: <Radio size={22} className="text-purple-400" />,
      pros: ['最大の柔軟性', '既存設備を活用', 'フォールバック対応'],
    },
  ]

  return (
    <div className="space-y-3">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            使用する照明プロトコルを選んでください。
            <strong className="text-zinc-300"> Zigbee</strong> は無線で後付けが簡単、
            <strong className="text-zinc-300"> DALI-2</strong> は有線で業務用途向けです。
            わからない場合は <strong className="text-zinc-300">Zigbee のみ</strong> を選んでください。
          </p>
        </div>
      </div>

      {options.map(({ id, label, sub, icon, pros }) => {
        const isSelected = protocol === id
        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => setProtocol(id)}
            className="w-full text-left rounded-2xl p-4 transition-all"
            style={{
              background: isSelected ? `${accentColor}12` : 'rgba(255,255,255,0.03)',
              border: `2px solid ${isSelected ? accentColor : 'rgba(255,255,255,0.08)'}`,
            }}
            whileTap={{ scale: 0.985 }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: isSelected ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-zinc-100">{label}</p>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: accentColor }}
                    >
                      <Check size={9} color="#09090b" />
                    </motion.span>
                  )}
                </div>
                <p className="text-xs text-zinc-300 mb-2">{sub}</p>
                <ul className="space-y-0.5">
                  {pros.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                      <span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── Step 2: Configuration ─────────────────────────────────────────────────────

function Step2({
  protocol, zigbee, setZigbee, dali, setDali,
}: {
  protocol: Protocol
  zigbee: ZigbeeConfig; setZigbee: (z: ZigbeeConfig) => void
  dali: DaliConfig; setDali: (d: DaliConfig) => void
}) {
  const setZ = (key: keyof ZigbeeConfig) => (val: string) =>
    setZigbee({ ...zigbee, [key]: val })
  const setD = (key: keyof DaliConfig) => (val: string) =>
    setDali({ ...dali, [key]: val })

  const zoneRows: { key: string; label: string }[] = [
    { key: 'deviceAll',      label: '全体 (all)' },
    { key: 'deviceLiving',   label: 'リビング (living)' },
    { key: 'deviceBedroom',  label: '寝室 (bedroom)' },
    { key: 'deviceBathroom', label: '浴室 (bathroom)' },
    { key: 'deviceEntrance', label: '玄関 (entrance)' },
  ]

  return (
    <div className="space-y-6">
      {/* Zigbee section */}
      {(protocol === 'zigbee' || protocol === 'both') && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader icon={<Wifi size={15} className="text-cyan-400" />} title="Zigbee2MQTT 接続設定" color="#22d3ee" />
          <div className="space-y-3">
            <Field
              label="MQTT ブローカー URL"
              value={zigbee.mqttUrl}
              onChange={setZ('mqttUrl')}
              placeholder="mqtt://192.168.1.50:1883"
              hint="Zigbee2MQTT が動作しているサーバーのIPアドレス"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="ユーザー名" value={zigbee.username} onChange={setZ('username')} placeholder="lumina" />
              <Field label="パスワード" value={zigbee.password} onChange={setZ('password')} type="password" placeholder="（任意）" />
            </div>
            <Field
              label="ベーストピック"
              value={zigbee.baseTopic}
              onChange={setZ('baseTopic')}
              placeholder="zigbee2mqtt"
              hint="通常は zigbee2mqtt のまま変更不要"
            />
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-300 mb-3 flex items-center gap-1.5">
                <Server size={11} className="text-zinc-400" />
                ゾーン → Zigbee2MQTT デバイス名 のマッピング
              </p>
              <div className="space-y-2">
                {zoneRows.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-5 items-center gap-3">
                    <label className="col-span-2 text-[11px] text-zinc-300 text-right">{label}</label>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={(zigbee as any)[key]}
                        onChange={e => setZ(key as keyof ZigbeeConfig)(e.target.value)}
                        placeholder={DEFAULT_ZIGBEE[key as keyof ZigbeeConfig]}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DALI-2 section */}
      {(protocol === 'dali' || protocol === 'both') && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <SectionHeader icon={<Zap size={15} className="text-amber-400" />} title="DALI-2 ゲートウェイ設定" color="#f59e0b" />
          <div className="space-y-3">
            <Field
              label="ゲートウェイ URL"
              value={dali.gatewayUrl}
              onChange={setD('gatewayUrl')}
              placeholder="http://192.168.1.60"
              hint="Lunatone DALI-2 IoT 等のゲートウェイIPアドレス"
            />
            <Field label="API トークン" value={dali.token} onChange={setD('token')} type="password" placeholder="（認証が必要な場合）" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="コマンドパス" value={dali.commandPath} onChange={setD('commandPath')} placeholder="/command" />
              <Field label="ヘルスチェックパス" value={dali.healthPath} onChange={setD('healthPath')} placeholder="/status" />
            </div>
            <div className="pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-300 mb-3 flex items-center gap-1.5">
                <Server size={11} className="text-zinc-400" />
                ゾーン → DALI アドレス のマッピング
              </p>
              <div className="space-y-2">
                {zoneRows.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-5 items-center gap-3">
                    <label className="col-span-2 text-[11px] text-zinc-300 text-right">{label}</label>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={(dali as any)[key]}
                        onChange={e => setD(key as keyof DaliConfig)(e.target.value)}
                        placeholder={DEFAULT_DALI[key as keyof DaliConfig]}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                値の例: <code className="text-zinc-300">broadcast</code>（全体）、
                <code className="text-zinc-300">group:0</code>（グループ0）、
                <code className="text-zinc-300">short:5</code>（ショートアドレス5）
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Connection Scan ───────────────────────────────────────────────────

function Step3({
  scanStatus, scanResult, onScan, accentColor,
}: {
  scanStatus: ScanStatus
  scanResult: any
  onScan: () => void
  accentColor: string
}) {
  const isScanning = scanStatus === 'scanning'
  const isDone = scanStatus !== 'idle' && scanStatus !== 'scanning'

  return (
    <div className="space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle size={15} className="text-zinc-300 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            ボタンを押すと、<strong className="text-zinc-300">現在のサーバー設定</strong>を使って
            照明ドライバーへの接続を確認します。<br />
            接続できない場合は、手順4で環境変数のコピーができます。
          </p>
        </div>

        {/* Radar / result area */}
        <div className="flex flex-col items-center py-6">
          {!isDone ? (
            <div className="relative w-32 h-32 mb-4">
              {/* Static rings */}
              {[4, 16, 28, 40].map((inset, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border"
                  style={{
                    inset: `${inset}px`,
                    borderColor: `rgba(255,255,255,${0.04 + i * 0.01})`,
                  }}
                />
              ))}
              {/* Rotating sweep */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${accentColor}55 0deg, ${accentColor}10 50deg, transparent 80deg)`,
                    }}
                  />
                )}
              </AnimatePresence>
              {/* Ping rings when scanning */}
              {isScanning && [0, 0.6, 1.2].map((delay, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: `${accentColor}40` }}
                  initial={{ scale: 0.3, opacity: 0.6 }}
                  animate={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}
              {/* Center icon */}
              <div
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: isScanning ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${isScanning ? `${accentColor}50` : 'rgba(255,255,255,0.08)'}`,
                  }}
                  animate={isScanning ? { boxShadow: [`0 0 0px ${accentColor}00`, `0 0 16px ${accentColor}40`, `0 0 0px ${accentColor}00`] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <Lightbulb size={20} style={{ color: isScanning ? accentColor : '#52525b' }} />
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center mb-4"
            >
              {(scanStatus === 'connected' || scanStatus === 'partial') ? (
                <CheckCircle2 size={52} className="text-emerald-400 mb-2" />
              ) : (
                <XCircle size={52} className="text-red-400 mb-2" />
              )}
              <p className="text-base font-semibold" style={{
                color: scanStatus === 'connected' ? '#22c55e' : scanStatus === 'partial' ? '#f59e0b' : '#ef4444'
              }}>
                {scanStatus === 'connected' ? '接続成功！' : scanStatus === 'partial' ? '一部接続成功' : '接続できませんでした'}
              </p>
            </motion.div>
          )}

          <p className="text-xs text-zinc-300 text-center">
            {isScanning
              ? 'ネットワーク上のハブを確認中...'
              : scanStatus === 'connected'
              ? `バックエンド: ${scanResult?.backend ?? '—'}`
              : scanStatus === 'partial'
              ? '一部のドライバーのみ接続されています'
              : scanStatus === 'failed'
              ? '照明ドライバーが見つかりませんでした'
              : 'スキャンを開始してください'}
          </p>
        </div>

        {/* Scan result detail */}
        {isDone && scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl space-y-1.5"
          >
            {['zigbee', 'dali'].map(proto => {
              const driver = scanResult.drivers?.[proto]
              if (!driver) return null
              return (
                <div key={proto} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {proto === 'zigbee' ? <Wifi size={12} className="text-zinc-300" /> : <Zap size={12} className="text-zinc-300" />}
                    <span className="text-xs text-zinc-400 uppercase font-mono">{proto}</span>
                  </div>
                  <span className={`text-xs font-medium ${driver.connected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {driver.connected ? '接続済み' : '未接続'}
                  </span>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Scan button */}
        {!isScanning && (
          <motion.button
            onClick={onScan}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
            style={{
              background: isDone ? 'rgba(255,255,255,0.05)' : accentColor,
              color: isDone ? '#a1a1aa' : '#09090b',
              border: isDone ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {isDone ? (
              <><RefreshCw size={14} /> 再スキャン</>
            ) : (
              <><Radio size={14} /> スキャン開始</>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}

// ─── Step 4: Complete / Instructions ──────────────────────────────────────────

function Step4({
  scanStatus, envVars, copied, onCopy, accentColor, backHref,
}: {
  scanStatus: ScanStatus
  envVars: string
  copied: boolean
  onCopy: () => void
  accentColor: string
  backHref: string
}) {
  const isSuccess = scanStatus === 'connected' || scanStatus === 'partial'

  return (
    <div className="space-y-4">
      {/* Success banner */}
      {isSuccess ? (
        <div className="rounded-2xl p-5 text-center"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-emerald-400 mb-1">セットアップ完了！</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            照明ドライバーに正常に接続されました。<br />
            ゲストの滞在中フェーズで照明制御が有効になります。
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-4"
             style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-1">サーバーの環境変数を設定してください</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                以下の設定値を <code className="text-zinc-300 bg-zinc-800 px-1 rounded">.env.local</code> に追加し、
                サーバーを再起動してから「接続テスト」を再実行してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generated env vars */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-300 ml-2">.env.local</span>
          </div>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
              color: copied ? '#22c55e' : '#a1a1aa',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {copied ? <><Check size={11} /> コピー済み</> : <><Copy size={11} /> コピー</>}
          </button>
        </div>
        <pre className="px-4 py-3 text-[11px] text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
          {envVars}
        </pre>
      </div>

      {!isSuccess && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <ArrowRight size={12} style={{ color: accentColor }} /> 設定手順
          </h4>
          {[
            '上の設定値をコピーする',
            'サーバーの .env.local ファイルに貼り付ける',
            'ハブ（Zigbee2MQTT / DALI ゲートウェイ）を起動する',
            'サーバーを再起動する',
            'ステップ3に戻り、再スキャンする',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
              >
                {i + 1}
              </div>
              <p className="text-xs text-zinc-400 pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      )}

      <Link href={backHref}>
        <button
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
          style={{ background: isSuccess ? accentColor : 'rgba(255,255,255,0.05)', color: isSuccess ? '#09090b' : '#a1a1aa' }}
        >
          {isSuccess ? '設定を完了する' : 'ポータルに戻る'}
        </button>
      </Link>
    </div>
  )
}

// ─── Main Wizard ───────────────────────────────────────────────────────────────

const STEP_LABELS = ['プロトコル', '接続設定', '接続テスト', '設定完了']

export default function LightingSetupWizard({
  accentColor, backHref, portalLabel,
}: {
  accentColor: string
  backHref: string
  portalLabel: string
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [zigbee, setZigbee] = useState<ZigbeeConfig>(DEFAULT_ZIGBEE)
  const [dali, setDali] = useState<DaliConfig>(DEFAULT_DALI)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [scanResult, setScanResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const envVars = protocol ? generateEnvVars(protocol, zigbee, dali) : ''

  const runScan = useCallback(async () => {
    setScanStatus('scanning')
    setScanResult(null)
    await new Promise(r => setTimeout(r, 2400))
    try {
      const res = await fetch('/api/lighting', { method: 'GET' })
      const data = await res.json()
      setScanResult(data)
      const zOk = data.drivers?.zigbee?.connected ?? false
      const dOk = data.drivers?.dali?.connected ?? false
      if (data.connected || zOk || dOk) {
        setScanStatus((zOk && dOk) || data.backend === 'both' ? 'connected' : zOk || dOk ? 'partial' : 'connected')
      } else {
        setScanStatus('failed')
      }
    } catch {
      setScanStatus('failed')
    }
  }, [])

  const copyEnvVars = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(envVars)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch { /* ignore */ }
  }, [envVars])

  const canAdvance =
    step === 1 ? protocol !== null :
    step === 2 ? true :
    step === 3 ? scanStatus !== 'idle' && scanStatus !== 'scanning' :
    false

  const nextLabel =
    step === 1 ? '接続設定へ' :
    step === 2 ? '接続テストへ' :
    step === 3 ? '結果を確認' :
    '完了'

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs text-zinc-300">
        <Link href={backHref} className="hover:text-zinc-300 transition-colors">{portalLabel}</Link>
        <span className="text-zinc-400">/</span>
        <span className="text-zinc-400">照明設定ウィザード</span>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3 mb-7">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Lightbulb size={20} style={{ color: accentColor }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">照明設定ウィザード</h1>
          <p className="text-xs text-zinc-300 mt-0.5">Zigbee / DALI-2 ドライバーへの接続を設定します</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEP_LABELS.map((label, i) => {
          const num = (i + 1) as 1 | 2 | 3 | 4
          const isActive = step === num
          const isDone = step > num
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none last:flex-shrink-0">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isDone ? accentColor : isActive ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isDone || isActive ? accentColor : 'rgba(255,255,255,0.1)'}`,
                    color: isDone ? '#09090b' : isActive ? accentColor : '#52525b',
                  }}
                  animate={isActive ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isDone ? <Check size={12} /> : num}
                </motion.div>
                <span
                  className="text-[11px] mt-1.5 whitespace-nowrap font-medium"
                  style={{ color: isActive ? accentColor : isDone ? '#71717a' : '#52525b' }}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <motion.div
                  className="flex-1 h-px mx-2 mb-4"
                  style={{ background: step > num ? accentColor : 'rgba(255,255,255,0.07)' }}
                  animate={step > num ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 2, repeat: step > num ? Infinity : 0 }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
        >
          {step === 1 && <Step1 protocol={protocol} setProtocol={setProtocol} accentColor={accentColor} />}
          {step === 2 && protocol && (
            <Step2 protocol={protocol} zigbee={zigbee} setZigbee={setZigbee} dali={dali} setDali={setDali} />
          )}
          {step === 3 && (
            <Step3 scanStatus={scanStatus} scanResult={scanResult} onScan={runScan} accentColor={accentColor} />
          )}
          {step === 4 && (
            <Step4
              scanStatus={scanStatus} envVars={envVars} copied={copied}
              onCopy={copyEnvVars} accentColor={accentColor} backHref={backHref}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-zinc-800">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={15} /> 戻る
        </button>

        {step < 4 && (
          <motion.button
            onClick={() => {
              if (step === 3 && scanStatus === 'idle') { runScan(); return }
              setStep(s => Math.min(4, s + 1) as 1 | 2 | 3 | 4)
            }}
            disabled={!canAdvance || scanStatus === 'scanning'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ background: accentColor, color: '#09090b' }}
            whileTap={{ scale: 0.96 }}
          >
            {step === 3 && scanStatus === 'idle' ? (
              <><Radio size={14} /> スキャン開始</>
            ) : step === 3 && scanStatus === 'scanning' ? (
              <>スキャン中...</>
            ) : (
              <>{nextLabel} <ChevronRight size={15} /></>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
