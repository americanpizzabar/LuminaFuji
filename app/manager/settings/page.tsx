'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Mail, Shield, Wifi, Phone, Clock, Lightbulb,
  CheckCircle2, Eye, EyeOff, Save, ExternalLink, Zap, ArrowRight, MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import {
  setNotificationSettings, setFacilitySettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/lib/store'
import type { NotificationSettings, FacilitySettings } from '@/lib/store'

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-3 rounded-2xl shadow-xl whitespace-nowrap"
        >
          <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 transition-colors ${
        checked ? 'bg-teal-600 border-teal-500' : 'bg-zinc-700 border-zinc-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ─── Scene options ────────────────────────────────────────────────────────────

const SCENE_OPTIONS = [
  { value: 'dawn',    label: '夜明け',   emoji: '🌅' },
  { value: 'morning', label: '朝',       emoji: '☀️' },
  { value: 'day',     label: '昼',       emoji: '🌤' },
  { value: 'evening', label: 'くつろぎ', emoji: '🕯️' },
  { value: 'reading', label: '読書',     emoji: '📖' },
  { value: 'sleep',   label: '就寝',     emoji: '🌙' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

type ToastKind = 'notification' | 'facility' | null

export default function ManagerSettingsPage() {
  const [store, update] = useStore()
  const [toast, setToast] = useState<ToastKind>(null)

  // ── Notification settings state ──────────────────────────────────────────
  const ns = store.notificationSettings ?? DEFAULT_NOTIFICATION_SETTINGS
  const [emailEnabled, setEmailEnabled] = useState(ns.emailEnabled)
  const [emailAddress, setEmailAddress] = useState(ns.emailAddress)
  const [lineNotifyEnabled, setLineNotifyEnabled] = useState(ns.lineNotifyEnabled)
  const [lineNotifyToken, setLineNotifyToken] = useState(ns.lineNotifyToken)
  const [slackEnabled, setSlackEnabled] = useState(ns.slackEnabled)
  const [slackWebhook, setSlackWebhookUrl] = useState(ns.slackWebhook)
  const [showLineToken, setShowLineToken] = useState(false)
  const [showSlackUrl, setShowSlackUrl] = useState(false)

  // ── Facility settings state ───────────────────────────────────────────────
  const fs = store.facilitySettings
  const [wifiName, setWifiName] = useState(fs.wifiName)
  const [wifiPassword, setWifiPassword] = useState(fs.wifiPassword)
  const [checkInTime, setCheckInTime] = useState(fs.checkInTime)
  const [checkOutTime, setCheckOutTime] = useState(fs.checkOutTime)
  const [defaultScene, setDefaultScene] = useState(fs.defaultLightingScene)
  const [ownerPhone, setOwnerPhone] = useState(fs.ownerPhone)
  const [emergencyPhone, setEmergencyPhone] = useState(fs.emergencyPhone)
  const [hostMsgJa, setHostMsgJa] = useState(fs.hostWelcomeMessage)
  const [hostMsgEn, setHostMsgEn] = useState(fs.hostWelcomeMessageEn)
  const [showWifiPassword, setShowWifiPassword] = useState(false)

  // Sync from store when external changes occur
  useEffect(() => {
    const n = store.notificationSettings ?? DEFAULT_NOTIFICATION_SETTINGS
    setEmailEnabled(n.emailEnabled)
    setEmailAddress(n.emailAddress)
    setLineNotifyEnabled(n.lineNotifyEnabled)
    setLineNotifyToken(n.lineNotifyToken)
    setSlackEnabled(n.slackEnabled)
    setSlackWebhookUrl(n.slackWebhook)
  }, [store.notificationSettings])

  useEffect(() => {
    const f = store.facilitySettings
    setWifiName(f.wifiName)
    setWifiPassword(f.wifiPassword)
    setCheckInTime(f.checkInTime)
    setCheckOutTime(f.checkOutTime)
    setDefaultScene(f.defaultLightingScene)
    setOwnerPhone(f.ownerPhone)
    setEmergencyPhone(f.emergencyPhone)
    setHostMsgJa(f.hostWelcomeMessage)
    setHostMsgEn(f.hostWelcomeMessageEn)
  }, [store.facilitySettings])

  const showToast = (kind: ToastKind) => {
    setToast(kind)
    setTimeout(() => setToast(null), 2500)
  }

  const saveNotificationSettings = () => {
    const settings: NotificationSettings = {
      emailEnabled,
      emailAddress,
      lineNotifyEnabled,
      lineNotifyToken,
      slackEnabled,
      slackWebhook,
    }
    setNotificationSettings(settings)
    update({ notificationSettings: settings })
    showToast('notification')
  }

  const saveFacilitySettings = () => {
    const settings: FacilitySettings = {
      wifiName,
      wifiPassword,
      checkInTime,
      checkOutTime,
      defaultLightingScene: defaultScene,
      ownerPhone,
      emergencyPhone,
      hostWelcomeMessage: hostMsgJa,
      hostWelcomeMessageEn: hostMsgEn,
    }
    setFacilitySettings(settings)
    update({ facilitySettings: settings })
    showToast('facility')
  }

  const toastMessages: Record<NonNullable<ToastKind>, string> = {
    notification: '設定を保存しました',
    facility: '施設情報を保存しました',
  }

  return (
    <>
      <Toast message={toast ? toastMessages[toast] : ''} visible={toast !== null} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5 pb-4"
      >
        {/* Header */}
        <div>
          <h1 className="text-xl font-medium text-zinc-100">設定</h1>
          <p className="text-sm text-zinc-300 mt-0.5">通知設定・施設基本情報</p>
        </div>

        {/* ── SECTION A: 通知設定 ──────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
          <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Bell size={14} className="text-teal-400" />
            通知設定
          </h2>

          {/* メール通知 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200 font-medium flex items-center gap-2">
                  <Mail size={13} className="text-zinc-400" /> メール通知
                </p>
                <p className="text-xs text-zinc-300 mt-0.5">リクエスト受信時にメールで通知</p>
              </div>
              <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
            </div>

            <AnimatePresence>
              {emailEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <label className="text-xs text-zinc-300 mb-1 block">メールアドレス</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={e => setEmailAddress(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-zinc-800" />

          {/* LINE Notify */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200 font-medium">💬 LINE Notify</p>
                <p className="text-xs text-zinc-300 mt-0.5">LINEアプリでリアルタイム通知</p>
              </div>
              <Toggle checked={lineNotifyEnabled} onChange={setLineNotifyEnabled} />
            </div>

            <AnimatePresence>
              {lineNotifyEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1 space-y-2">
                    <label className="text-xs text-zinc-300 mb-1 block">LINE Notify トークン</label>
                    <div className="relative flex items-center">
                      <input
                        type={showLineToken ? 'text' : 'password'}
                        value={lineNotifyToken}
                        onChange={e => setLineNotifyToken(e.target.value)}
                        placeholder="トークンを入力..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLineToken(v => !v)}
                        className="absolute right-3 text-zinc-300 hover:text-zinc-300"
                      >
                        {showLineToken ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <a
                      href="https://notify-bot.line.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      LINE Notifyトークン取得方法 <ExternalLink size={10} />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Slack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-200 font-medium">🟣 Slack</p>
                <p className="text-xs text-zinc-300 mt-0.5">Slackチャンネルに通知</p>
              </div>
              <Toggle checked={slackEnabled} onChange={setSlackEnabled} />
            </div>

            <AnimatePresence>
              {slackEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1">
                    <label className="text-xs text-zinc-300 mb-1 block">Webhook URL</label>
                    <div className="relative flex items-center">
                      <input
                        type={showSlackUrl ? 'text' : 'password'}
                        value={slackWebhook}
                        onChange={e => setSlackWebhookUrl(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSlackUrl(v => !v)}
                        className="absolute right-3 text-zinc-300 hover:text-zinc-300"
                      >
                        {showSlackUrl ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Save notification settings */}
          <button
            onClick={saveNotificationSettings}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98]"
          >
            <Save size={14} /> 通知設定を保存
          </button>
        </div>

        {/* ── SECTION B: 施設基本情報 ─────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
            <Shield size={14} className="text-teal-400" />
            施設基本情報
          </h2>

          <div className="space-y-3.5">
            {/* Check-in / check-out */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1 block">
                  <Clock size={10} /> チェックイン
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1 block">
                  <Clock size={10} /> チェックアウト
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/40 transition-all"
                />
              </div>
            </div>

            {/* WiFi */}
            <div>
              <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1 block">
                <Wifi size={10} /> Wi-Fi ネットワーク名
              </label>
              <input
                type="text"
                value={wifiName}
                onChange={e => setWifiName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-300 mb-1 block">Wi-Fi パスワード</label>
              <div className="relative flex items-center">
                <input
                  type={showWifiPassword ? 'text' : 'password'}
                  value={wifiPassword}
                  onChange={e => setWifiPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowWifiPassword(v => !v)}
                  className="absolute right-3 text-zinc-300 hover:text-zinc-300"
                >
                  {showWifiPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Phone numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1 block">
                  <Phone size={10} /> ホスト電話
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1 block">
                  <Phone size={10} /> 緊急連絡先
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-teal-500/40 transition-all"
                />
              </div>
            </div>

            {/* Host welcome messages */}
            <div>
              <label className="text-xs text-zinc-300 mb-1 block">ホストメッセージ（日本語）</label>
              <textarea
                rows={2}
                value={hostMsgJa}
                onChange={e => setHostMsgJa(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-300 mb-1 block">ホストメッセージ（英語）</label>
              <textarea
                rows={2}
                value={hostMsgEn}
                onChange={e => setHostMsgEn(e.target.value)}
                placeholder="Host welcome message in English"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all resize-none"
              />
            </div>

            {/* Default lighting scene */}
            <div>
              <label className="text-xs text-zinc-300 mb-2 flex items-center gap-1 block">
                <Lightbulb size={10} /> チェックイン時のデフォルト照明シーン
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCENE_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDefaultScene(value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${
                      defaultScene === value
                        ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                        : 'border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveFacilitySettings}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98]"
            >
              <Save size={14} /> 施設情報を保存
            </button>
          </div>
        </div>

        {/* ── LIGHTING HARDWARE SETUP ──────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            照明ハードウェア設定
          </h2>
          <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
            Zigbee2MQTT または DALI-2 ゲートウェイへの接続設定と動作確認ができます。
            ハブのスキャン・デバイスの選択・環境変数のコピーをガイドに従って行えます。
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: '📡', label: 'Zigbee2MQTT', sub: '無線接続' },
              { icon: '⚡', label: 'DALI-2', sub: '有線制御' },
              { icon: '🔗', label: '接続テスト', sub: 'リアルタイム' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-[11px] font-medium text-zinc-300">{label}</p>
                <p className="text-[11px] text-zinc-400">{sub}</p>
              </div>
            ))}
          </div>
          <Link href="/manager/lighting-setup">
            <button className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/18 text-amber-400 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]">
              照明設定ウィザードを開く <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* ── RECOMMENDED PLACES ──────────────────────────────────────────── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
            <MapPin size={14} className="text-emerald-400" />
            おすすめスポット
          </h2>
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
            ゲストの「周辺マップ」に表示されるおすすめスポットを追加・編集できます。
            公式サイトや Google Maps のリンクも設定できます。
          </p>
          <Link href="/manager/places">
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/18 text-emerald-400 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]">
              スポットを編集する <ArrowRight size={14} />
            </button>
          </Link>
        </div>

      </motion.div>
    </>
  )
}
